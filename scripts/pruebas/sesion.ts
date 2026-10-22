// Pruebas en navegador real (Chromium) contra el sitio publicado.
//
// No se corre directo: scripts/pruebas/correr.sh lo ejecuta en un contenedor desechable,
// le pasa el sitio y los datos de un cliente temporal, y borra ese cliente al terminar.
//
// Revisa: catálogo y detalle de experiencias, registro e inicio de sesión con regreso (?next=),
// sesión al recargar (F5), formulario de perfil, navegación del panel, redirección por rol,
// formulario de reserva con la fecha elegida (sin enviarlo) y sesión vencida.
// No crea reservas ni pagos.

import { chromium, type Browser, type BrowserContext, type Page, type Response } from 'playwright'

const BASE = variable('BASE_URL').replace(/\/+$/, '')
const CLAVE_SESION = variable('CLAVE_SESION') // clave del store de sesión en localStorage
const EMAIL = variable('EMAIL_PRUEBA')
const CLAVE = variable('CLAVE_PRUEBA')
const NOMBRE = 'Prueba'
const APELLIDO = 'Automática'
// El sitio publicado pasa por Cloudflare: márgenes amplios
const ESPERA = 20_000
// Tiempo para que una redirección indebida alcance a ocurrir antes de revisar la URL
const PAUSA = 1_500

function variable(nombre: string): string {
  const valor = process.env[nombre]
  if (!valor) {
    console.error(`Falta la variable ${nombre}. Corre las pruebas con: bash scripts/pruebas/correr.sh`)
    process.exit(2)
  }
  return valor
}

let fallas = 0
let omitidas = 0

function revisar(nombre: string, cumple: boolean, detalle = ''): void {
  if (!cumple) fallas++
  console.log(`${cumple ? 'OK     ' : 'FALLA  '} ${nombre}${detalle ? ` → ${detalle}` : ''}`)
}

function omitir(nombre: string, motivo: string): void {
  omitidas++
  console.log(`OMITIDA ${nombre} → ${motivo}`)
}

// Si una sección se interrumpe cuenta como falla, y las demás siguen
async function seccion(titulo: string, pasos: () => Promise<void>): Promise<void> {
  console.log(`\n── ${titulo}`)
  try {
    await pasos()
  } catch (err) {
    revisar(`${titulo}: se interrumpió`, false, (err as Error).message.split('\n')[0])
  }
}

const ruta = (pagina: Page): string => pagina.url().replace(BASE, '') || '/'

const parametroNext = (pagina: Page): string | null => new URL(pagina.url()).searchParams.get('next')

async function esperarRuta(pagina: Page, patron: RegExp): Promise<boolean> {
  return pagina.waitForURL(patron, { timeout: ESPERA }).then(() => true, () => false)
}

async function esperarTexto(pagina: Page, texto: RegExp | string): Promise<boolean> {
  return pagina.getByText(texto).first().waitFor({ timeout: ESPERA }).then(() => true, () => false)
}

const erroresJs: string[] = []

async function nuevaPagina(contexto: BrowserContext): Promise<Page> {
  const pagina = await contexto.newPage()
  pagina.on('pageerror', (err) => erroresJs.push(`${ruta(pagina)}: ${err.message}`))
  return pagina
}

async function principal(): Promise<void> {
  const navegador: Browser = await chromium.launch()
  // Agente de Chrome normal: sin "HeadlessChrome", que algunos filtros de bots bloquean
  const opciones = {
    viewport: { width: 1366, height: 900 },
    locale: 'es-CO',
    timezoneId: 'America/Bogota',
    userAgent: `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${navegador.version()} Safari/537.36`,
  }
  console.log(`Sitio: ${BASE}`)
  console.log(`Cliente temporal: ${EMAIL}`)

  let slug: string | null = null

  await seccion('Sitio público', async () => {
    const contexto = await navegador.newContext(opciones)
    contexto.setDefaultTimeout(ESPERA)
    const p = await nuevaPagina(contexto)

    const catalogo = await p.goto(`${BASE}/experiencias`)
    revisar('el catálogo responde', catalogo?.status() === 200, String(catalogo?.status()))
    await p.getByText('Cargando experiencias…').waitFor({ state: 'hidden' })
    const enlaces = p.locator('a[href^="/experiencias/"]')
    const tarjetas = await enlaces.count()
    // Lo que dice el API, para distinguir "no hay experiencias" de "el catálogo no las muestra"
    const respuestaApi = await contexto.request.get(`${BASE}/api/v1/tours?active=true&limit=1`)
    const cuerpoApi = (await respuestaApi.json().catch(() => ({}))) as { data?: unknown[]; pagination?: { total?: number } }
    const publicadas = cuerpoApi.pagination?.total ?? cuerpoApi.data?.length ?? 0
    if (tarjetas === 0 && publicadas === 0) {
      omitir('página de detalle', 'no hay experiencias publicadas')
    } else if (tarjetas === 0) {
      revisar('el catálogo muestra las experiencias', false, `${publicadas} activas en el API, 0 en la página`)
    } else {
      revisar('el catálogo muestra las experiencias', true, `${tarjetas} ${tarjetas === 1 ? 'tarjeta' : 'tarjetas'}`)
      const href = (await enlaces.first().getAttribute('href')) ?? ''
      slug = href.split('/')[2] || null
      const detalle = await p.goto(`${BASE}${href}`)
      revisar('la página de detalle responde', detalle?.status() === 200, `${href} → ${detalle?.status()}`)
      const titulo = ((await p.locator('h1').first().textContent()) ?? '').trim()
      revisar('el detalle muestra el nombre', titulo.length > 0, titulo.slice(0, 70))
      const og = await p.locator('meta[property="og:title"]').getAttribute('content')
      revisar('vista previa al compartir (og:title)', Boolean(og), og?.slice(0, 70) ?? 'sin og:title')
    }

    const inexistente = await p.goto(`${BASE}/experiencias/no-existe-${Date.now()}`)
    const amigable = await p.getByText('No encontramos esta experiencia').isVisible()
    revisar('experiencia inexistente → 404 con página propia', inexistente?.status() === 404 && amigable, String(inexistente?.status()))

    await p.goto(`${BASE}/cliente/reservas`)
    const alLogin = await esperarRuta(p, /\/auth\/login\?next=/)
    revisar('página del panel sin sesión → login con regreso', alLogin && parametroNext(p) === '/cliente/reservas', ruta(p))
    await contexto.close()
  })

  // Mismo navegador para el resto: es el recorrido de un cliente
  const contexto = await navegador.newContext(opciones)
  contexto.setDefaultTimeout(ESPERA)
  const p = await nuevaPagina(contexto)
  let conSesion = false

  await seccion('Registro e inicio de sesión', async () => {
    await p.goto(`${BASE}/auth/register?next=%2Fcliente%2Freservas`)
    await p.fill('input[name="firstName"]', NOMBRE)
    await p.fill('input[name="lastName"]', APELLIDO)
    await p.fill('input[name="email"]', EMAIL)
    await p.fill('input[name="password"]', CLAVE)
    await p.fill('input[name="confirmPassword"]', CLAVE)
    const registro = p.waitForResponse((r) => r.url().endsWith('/api/v1/auth/register'))
    await p.getByRole('button', { name: /crear cuenta/i }).click()
    const respuesta = await registro
    const mensaje = respuesta.status() === 201 ? '' : ` ${((await respuesta.json().catch(() => ({}))) as { message?: string }).message ?? ''}`
    revisar('registro del cliente temporal', respuesta.status() === 201, `${respuesta.status()}${mensaje}`)
    if (respuesta.status() !== 201) return

    const alLogin = await esperarRuta(p, /\/auth\/login\?next=/)
    revisar('registro → login con el mismo regreso', alLogin && parametroNext(p) === '/cliente/reservas', ruta(p))
    if (!alLogin) await p.goto(`${BASE}/auth/login?next=%2Fcliente%2Freservas`)

    await p.fill('input[type="email"]', EMAIL)
    await p.fill('input[type="password"]', CLAVE)
    await p.getByRole('button', { name: /entrar/i }).click()
    conSesion = await esperarRuta(p, /\/cliente\/reservas$/)
    revisar('el login vuelve a la página pedida', conSesion, ruta(p))
  })

  if (!conSesion) {
    omitir('pruebas con sesión', 'no se pudo iniciar sesión con el cliente temporal')
  } else {
    await seccion('Sesión al recargar (F5)', async () => {
      await p.goto(`${BASE}/cliente/reservas`)
      await esperarTexto(p, /reservas en total/)
      await p.waitForTimeout(PAUSA)
      revisar('carga completa de una página del panel con sesión', ruta(p) === '/cliente/reservas', ruta(p))

      await p.reload()
      await esperarTexto(p, /reservas en total/)
      await p.waitForTimeout(PAUSA)
      revisar('F5 no saca al login', ruta(p) === '/cliente/reservas', ruta(p))

      await p.goto(`${BASE}/cliente/perfil`)
      const campoNombre = p.locator('input[name="firstName"]')
      await campoNombre.waitFor({ timeout: ESPERA })
      await p.waitForTimeout(PAUSA)
      const valores = `${await campoNombre.inputValue()} ${await p.locator('input[name="lastName"]').inputValue()}`
      revisar('el perfil trae los datos después de una carga completa', valores === `${NOMBRE} ${APELLIDO}`, `"${valores}"`)
    })

    await seccion('Navegación del panel', async () => {
      // Cuenta los cambios del DOM en los que el menú lateral desaparece (pantallazo en blanco)
      await p.evaluate(() => {
        const w = window as unknown as { __sinMenu: number }
        w.__sinMenu = 0
        new MutationObserver(() => {
          if (!document.querySelector('aside')) w.__sinMenu++
        }).observe(document.body, { childList: true, subtree: true })
      })
      await p.getByRole('link', { name: 'Mis reservas', exact: true }).click()
      const llego = await esperarRuta(p, /\/cliente\/reservas$/)
      const sinMenu = await p.evaluate(() => (window as unknown as { __sinMenu: number }).__sinMenu)
      revisar('el menú lateral navega sin pantallazo en blanco', llego && sinMenu === 0, `${ruta(p)}, ${sinMenu} cambios sin menú`)

      await p.goto(`${BASE}/admin`)
      const devuelto = await esperarRuta(p, /\/cliente$/)
      await p.waitForTimeout(PAUSA)
      revisar('un cliente en /admin vuelve a su panel', devuelto && ruta(p) === '/cliente', ruta(p))
    })

    await seccion('Reserva desde el detalle (sin enviarla)', async () => {
      if (!slug) {
        omitir('formulario de reserva', 'no hay experiencias publicadas')
        return
      }
      await p.goto(`${BASE}/experiencias/${slug}`)
      const fechas = p.locator('button[aria-pressed]:not([disabled])')
      // Las fechas se cargan en el navegador: esperar a que aparezcan o al aviso de que no hay
      await fechas.first().or(p.getByText('Aún no hay fechas publicadas')).first().waitFor()

      if ((await fechas.count()) > 0) {
        await fechas.first().click()
        await p.getByRole('button', { name: /^reservar$/i }).click()
        const enFormulario = await esperarRuta(p, /\/reservas\/nueva\?tour=[^&]+&avail=/)
        revisar('Reservar lleva al formulario con la fecha elegida', enFormulario, ruta(p))
        await esperarTexto(p, 'Resumen')
        await p.waitForTimeout(PAUSA)
        const resumen = (await p.locator('.card.sticky').textContent()) ?? ''
        const fecha = resumen.match(/\d{1,2} de [a-záéíóúñ]+ de \d{4}/i)?.[0]
        revisar('el formulario muestra la fecha', Boolean(fecha), fecha ?? resumen.slice(0, 80))
        const ciudad = await p.locator('select').first().inputValue()
        revisar('ciudad o punto de encuentro preseleccionado', ciudad !== '', ciudad || 'vacío')
      } else {
        await p.getByRole('button', { name: /^reservar$/i }).click()
        const enFormulario = await esperarRuta(p, /\/reservas\/nueva\?tour=/)
        revisar('Reservar (sin fechas publicadas) lleva al formulario', enFormulario, ruta(p))
      }
    })

    await seccion('Sesión vencida', async () => {
      // Se dañan los tokens guardados: el API responde 401, el refresh falla y se pide login otra vez
      await p.evaluate((clave) => {
        const guardado = JSON.parse(localStorage.getItem(clave) ?? '{}') as { state?: { tokens?: unknown } }
        if (guardado.state) guardado.state.tokens = { accessToken: 'vencido', refreshToken: 'vencido' }
        localStorage.setItem(clave, JSON.stringify(guardado))
      }, CLAVE_SESION)
      const rechazos: string[] = []
      const anotar = (r: Response): void => {
        if (r.status() >= 400) rechazos.push(`${new URL(r.url()).pathname} ${r.status()}`)
      }
      p.on('response', anotar)
      await p.goto(`${BASE}/cliente/reservas`)
      const alLogin = await esperarRuta(p, /\/auth\/login\?next=/)
      await p.waitForTimeout(PAUSA)
      p.off('response', anotar)
      revisar('sesión vencida → login con regreso', alLogin && parametroNext(p) === '/cliente/reservas', ruta(p))
      const api401 = rechazos.some((x) => x.startsWith('/api/v1/reservas') && x.endsWith(' 401'))
      const refresh = rechazos.some((x) => x.startsWith('/api/v1/auth/refresh '))
      revisar('la cerró el cliente del API (401 y refresh rechazado)', api401 && refresh, rechazos.join(', ') || 'sin respuestas de error')
    })
  }

  console.log('')
  revisar('sin errores de JavaScript en las páginas', erroresJs.length === 0, erroresJs.slice(0, 3).join(' | '))
  await navegador.close()

  const resumen = fallas === 0 ? 'Todo bien' : `${fallas} ${fallas === 1 ? 'falla' : 'fallas'}`
  console.log(`\n${resumen}${omitidas ? ` (${omitidas} omitida${omitidas === 1 ? '' : 's'})` : ''} en ${BASE}`)
  process.exit(fallas === 0 ? 0 : 1)
}

principal().catch((err: unknown) => {
  console.error('Las pruebas no pudieron correr:', err)
  process.exit(1)
})

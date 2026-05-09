'use client'

import { useEffect, useState } from 'react'
import { useSiteConfig, useUpdateSiteConfig, useUploadImage } from '@/hooks/useSiteConfig'
import { FileEdit, Image, Save, Plus, Trash2 } from 'lucide-react'

type Tab = 'hero' | 'parques' | 'nosotros' | 'cta' | 'contacto' | 'footer'

const TABS: { id: Tab; label: string }[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'parques', label: 'Parques' },
  { id: 'nosotros', label: 'Nosotros' },
  { id: 'cta', label: 'CTA' },
  { id: 'contacto', label: 'Contacto' },
  { id: 'footer', label: 'Footer' },
]

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroStat { icon: string; label: string }
interface HeroData {
  badge: string; title1: string; title2: string; subtitle: string
  btn1: string; btn2: string; stats: HeroStat[]
}
interface ParqueItem { icon: string; name: string; desc: string; color: string }
interface NosotrosStat { value: string; label: string }
interface NosotrosFeature { icon: string; title: string; desc: string }
interface NosotrosData {
  label: string; title: string; text1: string; text2: string
  stats: NosotrosStat[]; features: NosotrosFeature[]
}
interface CtaData { title: string; subtitle: string; whatsapp: string }
interface ContactoData { phone: string; phoneHref: string; email: string; instagram: string; whatsapp: string }
interface FooterData { copyright: string }

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_HERO: HeroData = {
  badge: 'Ecoturismo en PNN Los Nevados · Colombia',
  title1: 'Descubre la naturaleza', title2: 'más salvaje de Colombia',
  subtitle: 'Volcanes nevados, selvas vírgenes, valles de palmas de cera y ballenas en el Pacífico.',
  btn1: 'Ver tours', btn2: 'Contáctanos',
  stats: [
    { icon: '🌿', label: '+9 destinos ecológicos' },
    { icon: '🦅', label: '+350 especies de aves' },
    { icon: '⭐', label: 'Guías certificados' },
  ],
}
const DEFAULT_PARQUES: ParqueItem[] = [
  { icon: '🏔️', name: 'PNN Los Nevados', desc: 'Volcanes y páramo', color: 'from-blue-500 to-blue-700' },
  { icon: '🌿', name: 'Selva de Florencia', desc: 'Bosque Andes-Amazonía', color: 'from-green-500 to-green-700' },
  { icon: '🌴', name: 'Valle del Cocora', desc: 'Palmas de cera', color: 'from-teal-500 to-teal-700' },
  { icon: '🐋', name: 'Bahía Solano', desc: 'Ballenas del Pacífico', color: 'from-cyan-500 to-cyan-700' },
]
const DEFAULT_NOSOTROS: NosotrosData = {
  label: 'QUIÉNES SOMOS', title: 'Ecoturismo responsable en Colombia',
  text1: 'Somos una agencia especializada en experiencias ecoturísticas en el Eje Cafetero y PNN Los Nevados.',
  text2: 'Trabajamos con guías certificados, aliados locales verificados y nos comprometemos con la conservación.',
  stats: [{ value: '9+', label: 'Destinos' }, { value: '500+', label: 'Viajeros' }, { value: '5★', label: 'Calificación' }],
  features: [
    { icon: '🦅', title: 'Avistamiento de aves', desc: 'Más de 350 especies registradas' },
    { icon: '🌿', title: 'Conservación', desc: 'Turismo de bajo impacto' },
    { icon: '🏔️', title: 'Alta montaña', desc: 'Guías certificados en altitud' },
    { icon: '👥', title: 'Comunidades', desc: 'Apoyo a familias locales' },
  ],
}
const DEFAULT_CTA: CtaData = { title: '¿Listo para la aventura?', subtitle: 'Reserva en línea con pago seguro. Depósito del 30% para confirmar tu cupo.', whatsapp: '573000000000' }
const DEFAULT_CONTACTO: ContactoData = { phone: '+57 300 000 0000', phoneHref: '573000000000', email: 'info@avesynaturaleza.travel', instagram: '@avesynaturaleza', whatsapp: '573000000000' }
const DEFAULT_FOOTER: FooterData = { copyright: '© 2024 Aves y Naturaleza · Ecoturismo responsable en Colombia' }

// ─── Shared components ────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    />
  )
}

function Textarea({ value, onChange, rows = 3 }: { value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <textarea
      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
      value={value} onChange={e => onChange(e.target.value)} rows={rows}
    />
  )
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick} disabled={saving}
      className="flex items-center gap-2 px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      <Save className="w-4 h-4" />
      {saving ? 'Guardando…' : 'Guardar'}
    </button>
  )
}

// ─── Section editors ──────────────────────────────────────────────────────────

function HeroEditor({ initial }: { initial: HeroData }) {
  const [data, setData] = useState<HeroData>(initial)
  const update = useUpdateSiteConfig()
  const uploadImg = useUploadImage()

  useEffect(() => { setData(initial) }, [initial])

  function set<K extends keyof HeroData>(k: K, v: HeroData[K]) {
    setData(prev => ({ ...prev, [k]: v }))
  }

  function setStat(i: number, field: keyof HeroStat, v: string) {
    const stats = [...data.stats]
    stats[i] = { ...stats[i], [field]: v }
    set('stats', stats)
  }

  function addStat() { set('stats', [...data.stats, { icon: '✨', label: 'Nuevo dato' }]) }
  function removeStat(i: number) { set('stats', data.stats.filter((_, idx) => idx !== i)) }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1]
      const res = await uploadImg.mutateAsync({ file: base64, filename: `hero-bg-${Date.now()}.${file.name.split('.').pop()}` })
      set('subtitle', data.subtitle) // keep state intact
      console.log('Uploaded:', res.data.data)
    }
    reader.readAsDataURL(file)
  }

  const saving = update.isPending

  return (
    <div className="space-y-4">
      <Field label="Badge / etiqueta superior"><Input value={data.badge} onChange={v => set('badge', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Título línea 1"><Input value={data.title1} onChange={v => set('title1', v)} /></Field>
        <Field label="Título línea 2 (verde)"><Input value={data.title2} onChange={v => set('title2', v)} /></Field>
      </div>
      <Field label="Subtítulo"><Textarea value={data.subtitle} onChange={v => set('subtitle', v)} /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Botón primario"><Input value={data.btn1} onChange={v => set('btn1', v)} /></Field>
        <Field label="Botón secundario"><Input value={data.btn2} onChange={v => set('btn2', v)} /></Field>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Estadísticas</label>
          <button onClick={addStat} className="flex items-center gap-1 text-xs text-brand-green hover:underline">
            <Plus className="w-3 h-3" /> Agregar
          </button>
        </div>
        <div className="space-y-2">
          {data.stats.map((s, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className="w-14 border border-gray-300 rounded-lg px-2 py-2 text-sm text-center" value={s.icon} onChange={e => setStat(i, 'icon', e.target.value)} placeholder="🌿" />
              <input className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={s.label} onChange={e => setStat(i, 'label', e.target.value)} placeholder="Dato" />
              <button onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <span className="flex items-center gap-1"><Image className="w-4 h-4" /> Imagen / video de fondo</span>
        </label>
        <p className="text-xs text-gray-500 mb-2">El video hero-1.mp4 ya está configurado. Para cambiarlo, sube un nuevo archivo:</p>
        <input type="file" accept="image/*,video/*" onChange={handleImageUpload} className="text-sm text-gray-600" />
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={() => update.mutate({ key: 'hero', value: data })} saving={saving} />
      </div>
    </div>
  )
}

function ParquesEditor({ initial }: { initial: ParqueItem[] }) {
  const [data, setData] = useState<ParqueItem[]>(initial)
  const update = useUpdateSiteConfig()

  useEffect(() => { setData(initial) }, [initial])

  function setItem(i: number, field: keyof ParqueItem, v: string) {
    const next = [...data]
    next[i] = { ...next[i], [field]: v }
    setData(next)
  }

  function addParque() { setData(prev => [...prev, { icon: '🌳', name: 'Nuevo parque', desc: 'Descripción', color: 'from-emerald-500 to-emerald-700' }]) }
  function removeParque(i: number) { setData(prev => prev.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-4">
      {data.map((p, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Parque {i + 1}</span>
            <button onClick={() => removeParque(i)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ícono emoji"><Input value={p.icon} onChange={v => setItem(i, 'icon', v)} placeholder="🏔️" /></Field>
            <Field label="Nombre"><Input value={p.name} onChange={v => setItem(i, 'name', v)} /></Field>
          </div>
          <Field label="Descripción corta"><Input value={p.desc} onChange={v => setItem(i, 'desc', v)} /></Field>
          <Field label="Clases de color (Tailwind gradient)"><Input value={p.color} onChange={v => setItem(i, 'color', v)} placeholder="from-blue-500 to-blue-700" /></Field>
        </div>
      ))}
      <button onClick={addParque} className="flex items-center gap-2 text-sm text-brand-green hover:underline">
        <Plus className="w-4 h-4" /> Agregar parque
      </button>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={() => update.mutate({ key: 'parques', value: data })} saving={update.isPending} />
      </div>
    </div>
  )
}

function NosotrosEditor({ initial }: { initial: NosotrosData }) {
  const [data, setData] = useState<NosotrosData>(initial)
  const update = useUpdateSiteConfig()

  useEffect(() => { setData(initial) }, [initial])

  function set<K extends keyof NosotrosData>(k: K, v: NosotrosData[K]) {
    setData(prev => ({ ...prev, [k]: v }))
  }

  function setStat(i: number, field: keyof NosotrosStat, v: string) {
    const stats = [...data.stats]; stats[i] = { ...stats[i], [field]: v }; set('stats', stats)
  }
  function setFeature(i: number, field: keyof NosotrosFeature, v: string) {
    const features = [...data.features]; features[i] = { ...features[i], [field]: v }; set('features', features)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Etiqueta superior"><Input value={data.label} onChange={v => set('label', v)} /></Field>
        <Field label="Título principal"><Input value={data.title} onChange={v => set('title', v)} /></Field>
      </div>
      <Field label="Párrafo 1"><Textarea value={data.text1} onChange={v => set('text1', v)} /></Field>
      <Field label="Párrafo 2"><Textarea value={data.text2} onChange={v => set('text2', v)} /></Field>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estadísticas (3 cifras)</label>
        <div className="grid grid-cols-3 gap-3">
          {data.stats.map((s, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <Field label="Valor"><Input value={s.value} onChange={v => setStat(i, 'value', v)} placeholder="9+" /></Field>
              <Field label="Etiqueta"><Input value={s.label} onChange={v => setStat(i, 'label', v)} placeholder="Destinos" /></Field>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Características (4 cards)</label>
        <div className="grid grid-cols-2 gap-3">
          {data.features.map((f, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Field label="Ícono"><Input value={f.icon} onChange={v => setFeature(i, 'icon', v)} placeholder="🦅" /></Field>
                <Field label="Título"><Input value={f.title} onChange={v => setFeature(i, 'title', v)} /></Field>
              </div>
              <Field label="Descripción"><Input value={f.desc} onChange={v => setFeature(i, 'desc', v)} /></Field>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={() => update.mutate({ key: 'nosotros', value: data })} saving={update.isPending} />
      </div>
    </div>
  )
}

function CtaEditor({ initial }: { initial: CtaData }) {
  const [data, setData] = useState<CtaData>(initial)
  const update = useUpdateSiteConfig()

  useEffect(() => { setData(initial) }, [initial])

  function set<K extends keyof CtaData>(k: K, v: string) { setData(prev => ({ ...prev, [k]: v })) }

  return (
    <div className="space-y-4">
      <Field label="Título"><Input value={data.title} onChange={v => set('title', v)} /></Field>
      <Field label="Subtítulo"><Textarea value={data.subtitle} onChange={v => set('subtitle', v)} /></Field>
      <Field label="WhatsApp (solo números, con código de país)"><Input value={data.whatsapp} onChange={v => set('whatsapp', v)} placeholder="573001234567" /></Field>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={() => update.mutate({ key: 'cta', value: data })} saving={update.isPending} />
      </div>
    </div>
  )
}

function ContactoEditor({ initial }: { initial: ContactoData }) {
  const [data, setData] = useState<ContactoData>(initial)
  const update = useUpdateSiteConfig()

  useEffect(() => { setData(initial) }, [initial])

  function set<K extends keyof ContactoData>(k: K, v: string) { setData(prev => ({ ...prev, [k]: v })) }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono (visible)"><Input value={data.phone} onChange={v => set('phone', v)} placeholder="+57 300 000 0000" /></Field>
        <Field label="Teléfono (href, solo números)"><Input value={data.phoneHref} onChange={v => set('phoneHref', v)} placeholder="573000000000" /></Field>
      </div>
      <Field label="Email"><Input value={data.email} onChange={v => set('email', v)} placeholder="info@avesynaturaleza.travel" /></Field>
      <Field label="Instagram"><Input value={data.instagram} onChange={v => set('instagram', v)} placeholder="@avesynaturaleza" /></Field>
      <Field label="WhatsApp (solo números)"><Input value={data.whatsapp} onChange={v => set('whatsapp', v)} placeholder="573000000000" /></Field>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={() => update.mutate({ key: 'contacto', value: data })} saving={update.isPending} />
      </div>
    </div>
  )
}

function FooterEditor({ initial }: { initial: FooterData }) {
  const [data, setData] = useState<FooterData>(initial)
  const update = useUpdateSiteConfig()

  useEffect(() => { setData(initial) }, [initial])

  return (
    <div className="space-y-4">
      <Field label="Texto de copyright"><Input value={data.copyright} onChange={v => setData({ copyright: v })} placeholder="© 2024 Aves y Naturaleza" /></Field>
      <div className="flex justify-end pt-2">
        <SaveButton onClick={() => update.mutate({ key: 'footer', value: data })} saving={update.isPending} />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContenidoPage() {
  const [tab, setTab] = useState<Tab>('hero')
  const { data: config, isLoading } = useSiteConfig()

  function get<T>(key: string, fallback: T): T {
    return (config?.[key] as T) ?? fallback
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-green/10 rounded-xl">
          <FileEdit className="w-5 h-5 text-brand-green" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editor de contenido</h1>
          <p className="text-sm text-gray-500">Edita el texto e imágenes de la página principal</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? 'border-b-2 border-brand-green text-brand-green bg-green-50/50'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Cargando configuración…</div>
          ) : (
            <>
              {tab === 'hero' && <HeroEditor initial={get('hero', DEFAULT_HERO)} />}
              {tab === 'parques' && <ParquesEditor initial={get('parques', DEFAULT_PARQUES)} />}
              {tab === 'nosotros' && <NosotrosEditor initial={get('nosotros', DEFAULT_NOSOTROS)} />}
              {tab === 'cta' && <CtaEditor initial={get('cta', DEFAULT_CTA)} />}
              {tab === 'contacto' && <ContactoEditor initial={get('contacto', DEFAULT_CONTACTO)} />}
              {tab === 'footer' && <FooterEditor initial={get('footer', DEFAULT_FOOTER)} />}
            </>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-400 text-center">
        Los cambios se aplican inmediatamente en la página principal.{' '}
        <a href="/" target="_blank" rel="noopener noreferrer" className="underline hover:text-brand-green">Ver página →</a>
      </div>
    </div>
  )
}

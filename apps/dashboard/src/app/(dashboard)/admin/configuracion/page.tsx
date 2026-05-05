'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Settings, Building2, DollarSign, Mail, Phone, Globe, Shield, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface Section {
  id: string
  label: string
  icon: ReactNode
}

const SECTIONS: Section[] = [
  { id: 'plataforma', label: 'Plataforma', icon: <Building2 className="w-4 h-4" /> },
  { id: 'comisiones', label: 'Comisiones', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'contacto', label: 'Contacto', icon: <Mail className="w-4 h-4" /> },
  { id: 'seguridad', label: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
]

export default function AdminConfiguracionPage() {
  const [active, setActive] = useState('plataforma')

  const handleSave = () => {
    toast.success('Configuración guardada')
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="text-gray-500 text-sm">Ajustes generales de la plataforma</p>
          </div>
          <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
            <Save className="w-4 h-4" /> Guardar cambios
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menú lateral */}
          <nav className="lg:col-span-1 card p-2 h-fit space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => setActive(s.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active === s.id
                    ? 'bg-brand-blue text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          {/* Contenido */}
          <div className="lg:col-span-3 space-y-4">
            {active === 'plataforma' && <PlataformaSection />}
            {active === 'comisiones' && <ComisionesSection />}
            {active === 'contacto' && <ContactoSection />}
            {active === 'seguridad' && <SeguridadSection />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

function PlataformaSection() {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Settings className="w-4 h-4 text-brand-blue" />
        <h2 className="font-semibold text-gray-900">Información de la plataforma</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Nombre de la agencia</label>
          <input defaultValue="Aves y Naturaleza" className="input" />
        </div>
        <div>
          <label className="label">Slogan</label>
          <input defaultValue="Agencia de viajes ecológicos" className="input" />
        </div>
        <div>
          <label className="label">Dominio principal</label>
          <input defaultValue="avesynaturaleza.travel" className="input" />
        </div>
        <div>
          <label className="label">Dominio alternativo</label>
          <input defaultValue="avesynaturaleza.uno" className="input" />
        </div>
        <div className="md:col-span-2">
          <label className="label">Descripción corta</label>
          <textarea
            defaultValue="Turismo de naturaleza y avistamiento de aves en los parques nacionales de Colombia."
            className="input"
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div>
          <label className="label">Zona horaria</label>
          <select defaultValue="America/Bogota" className="input">
            <option value="America/Bogota">America/Bogota (UTC-5)</option>
          </select>
        </div>
        <div>
          <label className="label">Moneda</label>
          <select defaultValue="COP" className="input">
            <option value="COP">COP — Peso colombiano</option>
            <option value="USD">USD — Dólar estadounidense</option>
          </select>
        </div>
      </div>
    </div>
  )
}

function ComisionesSection() {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <DollarSign className="w-4 h-4 text-brand-blue" />
        <h2 className="font-semibold text-gray-900">Tasas de comisión</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Comisión base freelance (%)</label>
          <div className="relative">
            <input type="number" defaultValue={10} min={0} max={50} className="input pr-8" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Se aplica cuando no hay tasa personalizada por revendedor</p>
        </div>
        <div>
          <label className="label">Comisión máxima freelance (%)</label>
          <div className="relative">
            <input type="number" defaultValue={25} min={0} max={50} className="input pr-8" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
        </div>
        <div>
          <label className="label">Depósito mínimo para reserva (%)</label>
          <div className="relative">
            <input type="number" defaultValue={30} min={0} max={100} className="input pr-8" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Porcentaje del total que se cobra como anticipo</p>
        </div>
        <div>
          <label className="label">Días para pago del saldo</label>
          <input type="number" defaultValue={7} min={1} className="input" />
          <p className="text-xs text-gray-400 mt-1">Días antes del tour para liquidar el saldo</p>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" defaultChecked className="rounded" />
          <div>
            <p className="text-sm font-medium text-gray-700">Pagar comisiones automáticamente</p>
            <p className="text-xs text-gray-400">Las comisiones se marcan como pagadas al completar la reserva</p>
          </div>
        </label>
      </div>
    </div>
  )
}

function ContactoSection() {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Mail className="w-4 h-4 text-brand-blue" />
        <h2 className="font-semibold text-gray-900">Información de contacto</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">
            <Mail className="w-3.5 h-3.5 inline mr-1" />
            Correo principal
          </label>
          <input type="email" defaultValue="turismoavesynaturaleza@gmail.com" className="input" />
        </div>
        <div>
          <label className="label">
            <Phone className="w-3.5 h-3.5 inline mr-1" />
            WhatsApp
          </label>
          <input type="tel" defaultValue="+57 320 645 1470" className="input" />
        </div>
        <div>
          <label className="label">
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            Instagram
          </label>
          <input defaultValue="@avesynaturaleza" className="input" placeholder="@usuario" />
        </div>
        <div>
          <label className="label">
            <Globe className="w-3.5 h-3.5 inline mr-1" />
            Facebook
          </label>
          <input defaultValue="" className="input" placeholder="URL de la página" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        <div className="md:col-span-2">
          <label className="label">Dirección</label>
          <input defaultValue="" className="input" placeholder="Calle 10 # 22-15, Manizales, Caldas" />
        </div>
        <div>
          <label className="label">Ciudad</label>
          <input defaultValue="Manizales" className="input" />
        </div>
        <div>
          <label className="label">Departamento</label>
          <input defaultValue="Caldas" className="input" />
        </div>
      </div>
    </div>
  )
}

function SeguridadSection() {
  return (
    <div className="card space-y-5">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <Shield className="w-4 h-4 text-brand-blue" />
        <h2 className="font-semibold text-gray-900">Seguridad y acceso</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="label">Tiempo de sesión (horas)</label>
          <input type="number" defaultValue={24} min={1} max={168} className="input w-40" />
          <p className="text-xs text-gray-400 mt-1">Tiempo antes de que expire el token de acceso</p>
        </div>

        <div className="pt-2 border-t border-gray-100 space-y-3">
          <p className="text-sm font-medium text-gray-700">Restricciones de registro</p>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="rounded" />
            <div>
              <p className="text-sm text-gray-700">Permitir registro público de clientes</p>
              <p className="text-xs text-gray-400">Los visitantes pueden crear su cuenta en /auth/register</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <div>
              <p className="text-sm text-gray-700">Requerir verificación de correo</p>
              <p className="text-xs text-gray-400">El cliente debe confirmar su email antes de poder ingresar</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" className="rounded" />
            <div>
              <p className="text-sm text-gray-700">Modo mantenimiento</p>
              <p className="text-xs text-gray-400">Bloquea el acceso a todos los roles excepto admin</p>
            </div>
          </label>
        </div>
      </div>
    </div>
  )
}

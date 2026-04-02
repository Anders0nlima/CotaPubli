import Link from "next/link";
import { Instagram, Facebook, Linkedin, Youtube, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#f97316] flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-white">Cotapubli</span>
            </div>
            <p className="text-sm leading-relaxed">
              Democratizando o acesso à publicidade de qualidade no Brasil.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Plataforma</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/como-funciona" className="hover:text-white transition-colors">Como funciona</Link></li>
              <li><Link href="/explorar" className="hover:text-white transition-colors">Explorar mídias</Link></li>
              <li><Link href="/explorar" className="hover:text-white transition-colors">Preços</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3 text-sm">
              <li><button className="hover:text-white transition-colors">Sobre nós</button></li>
              <li><button className="hover:text-white transition-colors">Carreiras</button></li>
              <li><button className="hover:text-white transition-colors">Parcerias</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li><button className="hover:text-white transition-colors">Termos de uso</button></li>
              <li><button className="hover:text-white transition-colors">Política de privacidade</button></li>
              <li><button className="hover:text-white transition-colors">Contato</button></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 Cotapubli. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Linkedin, Youtube, Mail].map((Icon, i) => (
              <button key={i} className="p-2 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

import { Facebook, Twitter, Linkedin, Github } from "lucide-react"

export function Footer() {
  return (
    <footer id="contact" className="bg-sidebar text-sidebar-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <span className="text-2xl font-bold">StreamLine</span>
            </div>
            <p className="text-sidebar-foreground/80 mb-6 max-w-md">
              Streamline your business operations with our intelligent SaaS platform. Automate tasks, boost
              productivity, and scale with confidence.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors">
                <Github className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Integrations
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-sidebar-foreground/80 hover:text-sidebar-foreground transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sidebar-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sidebar-foreground/60 text-sm">© 2024 StreamLine. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm transition-colors"
              >
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Populate the sidebar
//
// This is a script, and not included directly in the page, to control the total size of the book.
// The TOC contains an entry for each page, so if each page includes a copy of the TOC,
// the total size of the page becomes O(n**2).
class MDBookSidebarScrollbox extends HTMLElement {
    constructor() {
        super();
    }
    connectedCallback() {
        this.innerHTML = '<ol class="chapter"><li class="chapter-item expanded "><a href="Getting_Started_with_Nix_1.html"><strong aria-hidden="true">1.</strong> Getting Started with the Nix Ecosystem</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="nix/nix_language.html"><strong aria-hidden="true">1.1.</strong> Nix Language</a></li><li class="chapter-item expanded "><a href="nix/nix_package_manager.html"><strong aria-hidden="true">1.2.</strong> Nix Package Manager</a></li><li class="chapter-item expanded "><a href="nix/cachix_devour.html"><strong aria-hidden="true">1.3.</strong> Cachix and the devour-flake</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="nix/nixLang/nix_paths.html"><strong aria-hidden="true">1.3.1.</strong> Nix Paths</a></li><li class="chapter-item expanded "><a href="nix/index.html"><strong aria-hidden="true">1.3.2.</strong> Hardening README</a></li><li class="chapter-item expanded "><a href="nix/hardening_NixOS.html"><strong aria-hidden="true">1.3.3.</strong> Hardening NixOS</a></li><li class="chapter-item expanded "><a href="nix/hardening_networking.html"><strong aria-hidden="true">1.3.4.</strong> Hardening Networking</a></li></ol></li><li class="chapter-item expanded "><a href="vcs/git.html"><strong aria-hidden="true">1.4.</strong> Version Control with Git</a></li><li class="chapter-item expanded "><a href="vcs/jujutsu.html"><strong aria-hidden="true">1.5.</strong> Version Control with JJ</a></li></ol></li><li class="chapter-item expanded "><a href="installation/index.html"><strong aria-hidden="true">2.</strong> Installation</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="installation/unencrypted/unencrypted.html"><strong aria-hidden="true">2.1.</strong> Unencrypted Setups</a></li><li class="chapter-item expanded "><a href="installation/unencrypted/impermanence.html"><strong aria-hidden="true">2.2.</strong> Unencrypted Impermanence</a></li></ol></li><li class="chapter-item expanded "><a href="installation/enc/enc_install.html"><strong aria-hidden="true">3.</strong> Encrypted Setups</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="installation/enc/encrypted_impermanence.html"><strong aria-hidden="true">3.1.</strong> Encrypted Impermanence</a></li><li class="chapter-item expanded "><a href="installation/enc/USB_keyfile.html"><strong aria-hidden="true">3.2.</strong> USB Stick Keyfile</a></li><li class="chapter-item expanded "><a href="installation/enc/sops-nix.html"><strong aria-hidden="true">3.3.</strong> Sops-Nix encrypted secrets</a></li><li class="chapter-item expanded "><a href="installation/enc/lanzaboote.html"><strong aria-hidden="true">3.4.</strong> Secure Boot with Lanzaboote</a></li></ol></li><li class="chapter-item expanded "><a href="Understanding_Nix_Functions_2.html"><strong aria-hidden="true">4.</strong> Understanding Nix Functions</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="functions/practical_functions_2.1.html"><strong aria-hidden="true">4.1.</strong> Practical Nix Functions</a></li><li class="chapter-item expanded "><a href="functions/functions_and_modules_2.2.html"><strong aria-hidden="true">4.2.</strong> Functions and NixOS Modules</a></li></ol></li><li class="chapter-item expanded "><a href="NixOS_Modules_Explained_3.html"><strong aria-hidden="true">5.</strong> NixOS Modules Explained</a></li><li class="chapter-item expanded "><a href="Nix_Flakes_Explained_4.html"><strong aria-hidden="true">6.</strong> Nix Flakes Explained</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="flakes/flake_inputs_4.1.html"><strong aria-hidden="true">6.1.</strong> Nix Flake Inputs</a></li><li class="chapter-item expanded "><a href="flakes/flake_outputs_4.2.html"><strong aria-hidden="true">6.2.</strong> Nix Flake Outputs</a></li><li class="chapter-item expanded "><a href="flakes/flake_examples_4.3.html"><strong aria-hidden="true">6.3.</strong> Nix Flake Examples</a></li><li class="chapter-item expanded "><a href="flakes/helix_flake_4.4.html"><strong aria-hidden="true">6.4.</strong> Hack the Helix Flake</a></li><li class="chapter-item expanded "><a href="flakes/overlays_4.5.html"><strong aria-hidden="true">6.5.</strong> Extending Flakes with Custom Packages using Overlays</a></li><li class="chapter-item expanded "><a href="flakes/specialisations_4.6.html"><strong aria-hidden="true">6.6.</strong> NixOS Specialisations For Multiple Profiles</a></li></ol></li><li class="chapter-item expanded "><a href="Understanding_Top-Level_Attributes_5.html"><strong aria-hidden="true">7.</strong> Understanding Top-Level Attributes</a></li><li class="chapter-item expanded "><a href="Package_Definitions_Explained_6.html"><strong aria-hidden="true">8.</strong> Package Definitions Explained</a></li><li class="chapter-item expanded "><a href="Intro_to_Nix_Derivations_7.html"><strong aria-hidden="true">9.</strong> Intro to Nix Derivations</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="drv/builders_and_autotools.html"><strong aria-hidden="true">9.1.</strong> Builders and Autotools</a></li></ol></li><li class="chapter-item expanded "><a href="Comparing_Flakes_and_Traditional_Nix_8.html"><strong aria-hidden="true">10.</strong> Comparing Flakes and Traditional Nix</a></li><li class="chapter-item expanded "><a href="Debugging_and_Tracing_NixOS_Modules_9.html"><strong aria-hidden="true">11.</strong> Debugging and Tracing NixOS Modules</a></li><li class="chapter-item expanded "><a href="Working_with_Nixpkgs_Locally_10.html"><strong aria-hidden="true">12.</strong> Working with Nixpkgs Locally</a></li><li><ol class="section"><li class="chapter-item expanded "><a href="nixpkgs/fork_clone_contribute.html"><strong aria-hidden="true">12.1.</strong> Fork, Clone, Contribute</a></li><li class="chapter-item expanded "><a href="nixpkgs/local_package.html"><strong aria-hidden="true">12.2.</strong> Build a local package within a Nixpkgs Clone</a></li><li class="chapter-item expanded "><a href="nixpkgs/overlay.html"><strong aria-hidden="true">12.3.</strong> Nixpkgs Overlays to Override Version</a></li></ol></li><li class="chapter-item expanded "><a href="Nix_Pull_Requests_11.html"><strong aria-hidden="true">13.</strong> Nix Pull Requests</a></li><li class="chapter-item expanded "><a href="intro_to_nushell_on_NixOS.html"><strong aria-hidden="true">14.</strong> Intro to Nushell on NixOS</a></li><li class="chapter-item expanded "><a href="nixos_containers.html"><strong aria-hidden="true">15.</strong> NixOS Containers</a></li></ol>';
        // Set the current, active page, and reveal it if it's hidden
        let current_page = document.location.href.toString().split("#")[0].split("?")[0];
        if (current_page.endsWith("/")) {
            current_page += "index.html";
        }
        var links = Array.prototype.slice.call(this.querySelectorAll("a"));
        var l = links.length;
        for (var i = 0; i < l; ++i) {
            var link = links[i];
            var href = link.getAttribute("href");
            if (href && !href.startsWith("#") && !/^(?:[a-z+]+:)?\/\//.test(href)) {
                link.href = path_to_root + href;
            }
            // The "index" page is supposed to alias the first chapter in the book.
            if (link.href === current_page || (i === 0 && path_to_root === "" && current_page.endsWith("/index.html"))) {
                link.classList.add("active");
                var parent = link.parentElement;
                if (parent && parent.classList.contains("chapter-item")) {
                    parent.classList.add("expanded");
                }
                while (parent) {
                    if (parent.tagName === "LI" && parent.previousElementSibling) {
                        if (parent.previousElementSibling.classList.contains("chapter-item")) {
                            parent.previousElementSibling.classList.add("expanded");
                        }
                    }
                    parent = parent.parentElement;
                }
            }
        }
        // Track and set sidebar scroll position
        this.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                sessionStorage.setItem('sidebar-scroll', this.scrollTop);
            }
        }, { passive: true });
        var sidebarScrollTop = sessionStorage.getItem('sidebar-scroll');
        sessionStorage.removeItem('sidebar-scroll');
        if (sidebarScrollTop) {
            // preserve sidebar scroll position when navigating via links within sidebar
            this.scrollTop = sidebarScrollTop;
        } else {
            // scroll sidebar to current active section when navigating via "next/previous chapter" buttons
            var activeSection = document.querySelector('#sidebar .active');
            if (activeSection) {
                activeSection.scrollIntoView({ block: 'center' });
            }
        }
        // Toggle buttons
        var sidebarAnchorToggles = document.querySelectorAll('#sidebar a.toggle');
        function toggleSection(ev) {
            ev.currentTarget.parentElement.classList.toggle('expanded');
        }
        Array.from(sidebarAnchorToggles).forEach(function (el) {
            el.addEventListener('click', toggleSection);
        });
    }
}
window.customElements.define("mdbook-sidebar-scrollbox", MDBookSidebarScrollbox);

(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [953],
  {
    63: (e, r, t) => {
      'use strict';
      var o = t(7260);
      t.o(o, 'usePathname') &&
        t.d(r, {
          usePathname: function () {
            return o.usePathname;
          },
        });
    },
    1265: (e, r, t) => {
      'use strict';
      t.d(r, { MobileMenu: () => i });
      var o = t(5155),
        n = t(2115),
        a = t(2619),
        s = t.n(a);
      function i(e) {
        const { isOpen: r, onClose: t, navigationItems: a, currentPath: i } = e;
        return ((0, n.useEffect)(() => {
          const e = e => {
            'Escape' === e.key && t();
          };
          return (
            r &&
              (document.addEventListener('keydown', e),
              (document.body.style.overflow = 'hidden')),
            () => {
              (document.removeEventListener('keydown', e),
                (document.body.style.overflow = 'unset'));
            }
          );
        }, [r, t]),
        r)
          ? (0, o.jsxs)(o.Fragment, {
              children: [
                (0, o.jsx)('div', {
                  className:
                    'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden',
                  onClick: t,
                  'aria-hidden': 'true',
                }),
                (0, o.jsxs)('div', {
                  className:
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden '.concat(
                      r ? 'translate-x-0' : 'translate-x-full'
                    ),
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': 'Mobile navigation menu',
                  children: [
                    (0, o.jsxs)('div', {
                      className:
                        'flex items-center justify-between p-4 border-b border-gray-200',
                      children: [
                        (0, o.jsx)('h2', {
                          className: 'text-lg font-semibold text-gray-900',
                          children: 'Menu',
                        }),
                        (0, o.jsx)('button', {
                          onClick: t,
                          className:
                            'p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                          'aria-label': 'Close menu',
                          children: (0, o.jsx)('svg', {
                            className: 'w-6 h-6',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            'aria-hidden': 'true',
                            children: (0, o.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, o.jsx)('nav', {
                      className: 'flex flex-col p-4 space-y-2',
                      role: 'navigation',
                      children: a.map(e =>
                        (0, o.jsx)(
                          s(),
                          {
                            href: e.href,
                            className:
                              'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] '.concat(
                                i === e.href
                                  ? 'border-l-4'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              ),
                            style:
                              i === e.href
                                ? {
                                    backgroundColor: 'rgba(245, 39, 111, 0.1)',
                                    color: '#F5276F',
                                    borderLeftColor: '#F5276F',
                                  }
                                : {},
                            'aria-current': i === e.href ? 'page' : void 0,
                            children: e.label,
                          },
                          e.href
                        )
                      ),
                    }),
                    (0, o.jsx)('div', {
                      className:
                        'absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50',
                      children: (0, o.jsx)(s(), {
                        href: '/contact',
                        className:
                          'w-full text-white px-4 py-3 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center min-h-[48px]',
                        style: {
                          backgroundColor: '#F5276F',
                          color: 'white',
                          boxShadow: '0 0 0 2px rgba(245, 39, 111, 0.5)',
                        },
                        onMouseEnter: e => {
                          e.currentTarget.style.backgroundColor = '#C8094C';
                        },
                        onMouseLeave: e => {
                          e.currentTarget.style.backgroundColor = '#F5276F';
                        },
                        children: 'Get Started',
                      }),
                    }),
                  ],
                }),
              ],
            })
          : null;
      }
    },
    5481: (e, r, t) => {
      'use strict';
      (t.r(r), t.d(r, { BottomNavigation: () => l }));
      var o = t(5155);
      t(2115);
      var n = t(2619),
        a = t.n(n),
        s = t(63);
      const i = [
        {
          label: 'Home',
          href: '/',
          icon: (0, o.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, o.jsx)('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            }),
          }),
        },
        {
          label: 'Services',
          href: '/services',
          icon: (0, o.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, o.jsx)('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
            }),
          }),
        },
        {
          label: 'Blog',
          href: '/blog',
          icon: (0, o.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, o.jsx)('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
            }),
          }),
        },
        {
          label: 'Contact',
          href: '/contact',
          icon: (0, o.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, o.jsx)('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            }),
          }),
        },
      ];
      function l() {
        const e = (0, s.usePathname)();
        return (0, o.jsx)('nav', {
          className:
            'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40',
          role: 'navigation',
          'aria-label': 'Bottom navigation',
          children: (0, o.jsx)('div', {
            className: 'flex items-center justify-around px-2 py-1',
            children: i.map(r => {
              const t = e === r.href;
              return (0, o.jsxs)(
                a(),
                {
                  href: r.href,
                  className:
                    'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[64px] min-h-[56px] '.concat(
                      t
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    ),
                  'aria-current': t ? 'page' : void 0,
                  children: [
                    (0, o.jsx)('div', {
                      className: 'transition-transform '.concat(
                        t ? 'scale-110' : ''
                      ),
                      children: r.icon,
                    }),
                    (0, o.jsx)('span', {
                      className: 'text-xs font-medium mt-1 '.concat(
                        t ? 'font-semibold' : ''
                      ),
                      children: r.label,
                    }),
                  ],
                },
                r.href
              );
            }),
          }),
        });
      }
    },
    5545: (e, r, t) => {
      'use strict';
      (t.r(r), t.d(r, { Header: () => d }));
      var o = t(5155),
        n = t(2115),
        a = t(2619),
        s = t.n(a),
        i = t(63),
        l = t(1265);
      const c = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ];
      function d(e) {
        let { pageTitle: r } = e,
          [t, a] = (0, n.useState)(!1),
          d = (0, i.usePathname)();
        return (0, o.jsxs)(o.Fragment, {
          children: [
            (0, o.jsx)('header', {
              className:
                'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm',
              children: (0, o.jsx)('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                children: (0, o.jsxs)('div', {
                  className: 'flex justify-between items-center h-16 md:h-20',
                  children: [
                    (0, o.jsx)(s(), {
                      href: '/',
                      className:
                        'flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors',
                      'aria-label': 'Go to homepage',
                      children: (0, o.jsx)('img', {
                        src: '/images/icons/Vivid Auto Photography Logo.png',
                        alt: 'Vivid Auto Photography Logo',
                        className: 'w-48 h-48 object-contain',
                        width: 192,
                        height: 192,
                      }),
                    }),
                    (0, o.jsx)('nav', {
                      className:
                        'hidden md:flex items-center space-x-6 lg:space-x-8',
                      role: 'navigation',
                      children: c.map(e =>
                        (0, o.jsx)(
                          s(),
                          {
                            href: e.href,
                            className:
                              'text-sm font-medium transition-colors nav-link-brand '.concat(
                                d === e.href
                                  ? 'border-b-2 pb-1'
                                  : 'text-gray-700'
                              ),
                            style:
                              d === e.href
                                ? {
                                    color: '#F5276F',
                                    borderBottomColor: '#F5276F',
                                  }
                                : {},
                            'aria-current': d === e.href ? 'page' : void 0,
                            children: e.label,
                          },
                          e.href
                        )
                      ),
                    }),
                    (0, o.jsx)('div', {
                      className: 'hidden md:flex items-center space-x-4',
                      children: (0, o.jsx)(s(), {
                        href: '/contact',
                        className:
                          'bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary-dark transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2',
                        style: { backgroundColor: '#F5276F', color: 'white' },
                        onMouseEnter: e => {
                          e.currentTarget.style.backgroundColor = '#C8094C';
                        },
                        onMouseLeave: e => {
                          e.currentTarget.style.backgroundColor = '#F5276F';
                        },
                        children: 'Get Started',
                      }),
                    }),
                    (0, o.jsx)('button', {
                      onClick: () => {
                        a(!t);
                      },
                      className:
                        'md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'aria-label': 'Toggle mobile menu',
                      'aria-expanded': t,
                      children: (0, o.jsx)('svg', {
                        className: 'w-6 h-6',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        'aria-hidden': 'true',
                        children: t
                          ? (0, o.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            })
                          : (0, o.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M4 6h16M4 12h16M4 18h16',
                            }),
                      }),
                    }),
                  ],
                }),
              }),
            }),
            (0, o.jsx)(l.MobileMenu, {
              isOpen: t,
              onClose: () => {
                a(!1);
              },
              navigationItems: c,
              currentPath: d,
            }),
          ],
        });
      }
    },
    7565: (e, r, t) => {
      (Promise.resolve().then(t.t.bind(t, 2619, 23)),
        Promise.resolve().then(t.bind(t, 5481)),
        Promise.resolve().then(t.bind(t, 5545)),
        Promise.resolve().then(t.bind(t, 1265)));
    },
  },
  e => {
    (e.O(0, [619, 441, 255, 358], () => e((e.s = 7565))), (_N_E = e.O()));
  },
]);

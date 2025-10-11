(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [220],
  {
    63: (e, t, r) => {
      'use strict';
      var a = r(7260);
      r.o(a, 'usePathname') &&
        r.d(t, {
          usePathname: function () {
            return a.usePathname;
          },
        });
    },
    862: (e, t, r) => {
      (Promise.resolve().then(r.t.bind(r, 2619, 23)),
        Promise.resolve().then(r.bind(r, 5481)),
        Promise.resolve().then(r.bind(r, 5545)),
        Promise.resolve().then(r.bind(r, 1265)),
        Promise.resolve().then(r.bind(r, 2548)));
    },
    1265: (e, t, r) => {
      'use strict';
      r.d(t, { MobileMenu: () => i });
      var a = r(5155),
        o = r(2115),
        n = r(2619),
        s = r.n(n);
      function i(e) {
        const { isOpen: t, onClose: r, navigationItems: n, currentPath: i } = e;
        return ((0, o.useEffect)(() => {
          const e = e => {
            'Escape' === e.key && r();
          };
          return (
            t &&
              (document.addEventListener('keydown', e),
              (document.body.style.overflow = 'hidden')),
            () => {
              (document.removeEventListener('keydown', e),
                (document.body.style.overflow = 'unset'));
            }
          );
        }, [t, r]),
        t)
          ? (0, a.jsxs)(a.Fragment, {
              children: [
                (0, a.jsx)('div', {
                  className:
                    'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden',
                  onClick: r,
                  'aria-hidden': 'true',
                }),
                (0, a.jsxs)('div', {
                  className:
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden '.concat(
                      t ? 'translate-x-0' : 'translate-x-full'
                    ),
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': 'Mobile navigation menu',
                  children: [
                    (0, a.jsxs)('div', {
                      className:
                        'flex items-center justify-between p-4 border-b border-gray-200',
                      children: [
                        (0, a.jsx)('h2', {
                          className: 'text-lg font-semibold text-gray-900',
                          children: 'Menu',
                        }),
                        (0, a.jsx)('button', {
                          onClick: r,
                          className:
                            'p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                          'aria-label': 'Close menu',
                          children: (0, a.jsx)('svg', {
                            className: 'w-6 h-6',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            'aria-hidden': 'true',
                            children: (0, a.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, a.jsx)('nav', {
                      className: 'flex flex-col p-4 space-y-2',
                      role: 'navigation',
                      children: n.map(e =>
                        (0, a.jsx)(
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
                    (0, a.jsx)('div', {
                      className:
                        'absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50',
                      children: (0, a.jsx)(s(), {
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
    2548: (e, t, r) => {
      'use strict';
      (r.r(t), r.d(t, { default: () => l }));
      var a = r(5155),
        o = r(2115),
        n = r(5239),
        s = r(1029).hp;
      const i = function () {
          const e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : 10,
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 10;
          return 'data:image/svg+xml;base64,'.concat(
            s
              .from(
                '<svg width="'
                  .concat(e, '" height="')
                  .concat(
                    t,
                    '" xmlns="http://www.w3.org/2000/svg">\n      <defs>\n        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">\n          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />\n          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />\n          <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />\n        </linearGradient>\n      </defs>\n      <rect width="100%" height="100%" fill="url(#grad)" />\n    </svg>'
                  )
              )
              .toString('base64')
          );
        },
        l = e => {
          let {
              src: t,
              alt: r,
              width: s,
              height: l,
              priority: c = !1,
              mobileBreakpoint: d = 768,
              className: h = '',
              fill: m = !1,
              sizes: u,
              quality: x = 85,
              placeholder: f = 'blur',
              blurDataURL: g,
              objectFit: p = 'cover',
              loading: b = 'lazy',
              onLoad: v,
              onError: y,
              title: j,
              caption: w,
              figureClassName: k = '',
              includeStructuredData: N = !1,
              fallbackSrc: L,
              maxRetries: M = 2,
              retryDelay: C = 1e3,
              showErrorMessage: F = !0,
              errorMessage: S = 'Image failed to load',
              showLoadingIndicator: P = !0,
              loadingComponent: B,
              errorComponent: E,
            } = e,
            [H, T] = (0, o.useState)(!1),
            [V, _] = (0, o.useState)(!0),
            [z, W] = (0, o.useState)(!1),
            [O, I] = (0, o.useState)(t),
            [G, A] = (0, o.useState)(0),
            [D, J] = (0, o.useState)(''),
            R = g || i(s || 400, l || 300);
          (0, o.useEffect)(() => {
            (T(!1), _(!0), W(!1), I(t), A(0), J(''));
          }, [t]);
          const q = N
              ? {
                  '@context': 'https://schema.org',
                  '@type': 'ImageObject',
                  url: t,
                  description: r,
                  width: null == s ? void 0 : s.toString(),
                  height: null == l ? void 0 : l.toString(),
                  ...(w && { caption: w }),
                }
              : null,
            U = {
              src: O,
              alt: r,
              title: j || r,
              priority: c || 'eager' === b,
              quality: x,
              className: ''
                .concat(h, ' transition-all duration-500 ')
                .concat(H ? 'opacity-100 scale-100' : 'opacity-0 scale-105'),
              sizes:
                u ||
                '(max-width: '.concat(
                  d,
                  'px) 100vw, (max-width: 1024px) 50vw, 33vw'
                ),
              placeholder: f,
              blurDataURL: 'blur' === f ? R : void 0,
              onLoad: () => {
                (T(!0), _(!1), W(!1), null == v || v());
              },
              onError: e => {
                if (
                  (J('Failed to load image: '.concat(O)), _(!1), L && O !== L)
                ) {
                  (I(L), A(0), _(!0));
                  return;
                }
                if (G < M) {
                  const e = G + 1;
                  setTimeout(() => {
                    (A(e),
                      _(!0),
                      W(!1),
                      I(
                        ''
                          .concat(t, '?retry=')
                          .concat(e, '&t=')
                          .concat(Date.now())
                      ));
                  }, C);
                  return;
                }
                (W(!0), null == y || y());
              },
              style: { objectFit: p },
              key: ''.concat(O, '-').concat(G),
            };
          if (V && P && !H)
            return (
              B ||
              (0, a.jsx)('div', {
                className: ''.concat(
                  h,
                  ' bg-gray-100 flex items-center justify-center animate-pulse'
                ),
                style: { width: m ? '100%' : s, height: m ? '100%' : l },
                children: (0, a.jsxs)('div', {
                  className: 'flex flex-col items-center space-y-2',
                  children: [
                    (0, a.jsx)('div', {
                      className:
                        'w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin',
                    }),
                    (0, a.jsx)('span', {
                      className: 'text-xs text-gray-500',
                      children: 'Loading image...',
                    }),
                    G > 0 &&
                      (0, a.jsxs)('span', {
                        className: 'text-xs text-gray-400',
                        children: ['Retry ', G, '/', M],
                      }),
                  ],
                }),
              })
            );
          if (z)
            return (
              E ||
              (0, a.jsx)('div', {
                className: ''.concat(
                  h,
                  ' bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center text-red-600 text-sm p-4'
                ),
                style: { width: m ? '100%' : s, height: m ? '100%' : l },
                role: 'img',
                'aria-label': 'Failed to load image: '.concat(r),
                children: (0, a.jsxs)('div', {
                  className: 'flex flex-col items-center space-y-2 text-center',
                  children: [
                    (0, a.jsx)('svg', {
                      className: 'w-8 h-8 text-red-400',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      'aria-hidden': 'true',
                      children: (0, a.jsx)('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
                      }),
                    }),
                    F &&
                      (0, a.jsxs)(a.Fragment, {
                        children: [
                          (0, a.jsx)('span', {
                            className: 'font-medium',
                            children: S,
                          }),
                          (0, a.jsx)('span', {
                            className:
                              'text-xs text-red-500 max-w-full break-words',
                            children: r,
                          }),
                          !1,
                        ],
                      }),
                  ],
                }),
              })
            );
          const K = () => {
            if (m)
              return (0, a.jsx)('div', {
                className: 'relative overflow-hidden',
                children: (0, a.jsx)(n.default, { ...U, fill: !0 }),
              });
            if (!s || !l)
              throw Error('Width and height are required when fill is false');
            return (0, a.jsx)(n.default, { ...U, width: s, height: l });
          };
          return w
            ? (0, a.jsxs)(a.Fragment, {
                children: [
                  q &&
                    (0, a.jsx)('script', {
                      type: 'application/ld+json',
                      dangerouslySetInnerHTML: { __html: JSON.stringify(q) },
                    }),
                  (0, a.jsxs)('figure', {
                    className: ''.concat(k),
                    itemScope: !0,
                    itemType: 'https://schema.org/ImageObject',
                    children: [
                      K(),
                      (0, a.jsx)('figcaption', {
                        className: 'text-sm text-gray-600 mt-2 italic',
                        itemProp: 'caption',
                        children: w,
                      }),
                      (0, a.jsx)('meta', { itemProp: 'url', content: t }),
                      (0, a.jsx)('meta', {
                        itemProp: 'description',
                        content: r,
                      }),
                      s &&
                        (0, a.jsx)('meta', {
                          itemProp: 'width',
                          content: s.toString(),
                        }),
                      l &&
                        (0, a.jsx)('meta', {
                          itemProp: 'height',
                          content: l.toString(),
                        }),
                    ],
                  }),
                ],
              })
            : (0, a.jsxs)(a.Fragment, {
                children: [
                  q &&
                    (0, a.jsx)('script', {
                      type: 'application/ld+json',
                      dangerouslySetInnerHTML: { __html: JSON.stringify(q) },
                    }),
                  K(),
                ],
              });
        };
    },
    5481: (e, t, r) => {
      'use strict';
      (r.r(t), r.d(t, { BottomNavigation: () => l }));
      var a = r(5155);
      r(2115);
      var o = r(2619),
        n = r.n(o),
        s = r(63);
      const i = [
        {
          label: 'Home',
          href: '/',
          icon: (0, a.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, a.jsx)('path', {
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
          icon: (0, a.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, a.jsx)('path', {
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
          icon: (0, a.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, a.jsx)('path', {
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
          icon: (0, a.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, a.jsx)('path', {
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
        return (0, a.jsx)('nav', {
          className:
            'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40',
          role: 'navigation',
          'aria-label': 'Bottom navigation',
          children: (0, a.jsx)('div', {
            className: 'flex items-center justify-around px-2 py-1',
            children: i.map(t => {
              const r = e === t.href;
              return (0, a.jsxs)(
                n(),
                {
                  href: t.href,
                  className:
                    'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[64px] min-h-[56px] '.concat(
                      r
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    ),
                  'aria-current': r ? 'page' : void 0,
                  children: [
                    (0, a.jsx)('div', {
                      className: 'transition-transform '.concat(
                        r ? 'scale-110' : ''
                      ),
                      children: t.icon,
                    }),
                    (0, a.jsx)('span', {
                      className: 'text-xs font-medium mt-1 '.concat(
                        r ? 'font-semibold' : ''
                      ),
                      children: t.label,
                    }),
                  ],
                },
                t.href
              );
            }),
          }),
        });
      }
    },
    5545: (e, t, r) => {
      'use strict';
      (r.r(t), r.d(t, { Header: () => d }));
      var a = r(5155),
        o = r(2115),
        n = r(2619),
        s = r.n(n),
        i = r(63),
        l = r(1265);
      const c = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ];
      function d(e) {
        let { pageTitle: t } = e,
          [r, n] = (0, o.useState)(!1),
          d = (0, i.usePathname)();
        return (0, a.jsxs)(a.Fragment, {
          children: [
            (0, a.jsx)('header', {
              className:
                'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm',
              children: (0, a.jsx)('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                children: (0, a.jsxs)('div', {
                  className: 'flex justify-between items-center h-16 md:h-20',
                  children: [
                    (0, a.jsx)(s(), {
                      href: '/',
                      className:
                        'flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors',
                      'aria-label': 'Go to homepage',
                      children: (0, a.jsx)('img', {
                        src: '/images/icons/Vivid Auto Photography Logo.png',
                        alt: 'Vivid Auto Photography Logo',
                        className: 'w-48 h-48 object-contain',
                        width: 192,
                        height: 192,
                      }),
                    }),
                    (0, a.jsx)('nav', {
                      className:
                        'hidden md:flex items-center space-x-6 lg:space-x-8',
                      role: 'navigation',
                      children: c.map(e =>
                        (0, a.jsx)(
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
                    (0, a.jsx)('div', {
                      className: 'hidden md:flex items-center space-x-4',
                      children: (0, a.jsx)(s(), {
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
                    (0, a.jsx)('button', {
                      onClick: () => {
                        n(!r);
                      },
                      className:
                        'md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'aria-label': 'Toggle mobile menu',
                      'aria-expanded': r,
                      children: (0, a.jsx)('svg', {
                        className: 'w-6 h-6',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        'aria-hidden': 'true',
                        children: r
                          ? (0, a.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            })
                          : (0, a.jsx)('path', {
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
            (0, a.jsx)(l.MobileMenu, {
              isOpen: r,
              onClose: () => {
                n(!1);
              },
              navigationItems: c,
              currentPath: d,
            }),
          ],
        });
      }
    },
  },
  e => {
    (e.O(0, [619, 851, 441, 255, 358], () => e((e.s = 862))), (_N_E = e.O()));
  },
]);

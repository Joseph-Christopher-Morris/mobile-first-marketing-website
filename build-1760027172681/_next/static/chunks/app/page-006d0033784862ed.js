(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [974],
  {
    63: (e, t, a) => {
      'use strict';
      var s = a(7260);
      a.o(s, 'usePathname') &&
        a.d(t, {
          usePathname: function () {
            return s.usePathname;
          },
        });
    },
    740: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => l });
      var s = a(5155),
        r = a(7127),
        i = a.n(r),
        n = a(63);
      const o = 'http://localhost:3000';
      function l(e) {
        var t, a;
        let {
            title: r,
            description:
              l = 'Professional marketing services with mobile-first approach. Specializing in photography, analytics, and ad campaigns to grow your business.',
            keywords: c = [],
            image: d = '/images/hero-bg.jpg',
            article: m,
            noIndex: h = !1,
            canonicalUrl: u,
          } = e,
          x = (0, n.usePathname)(),
          g = r
            ? ''.concat(r, ' | Mobile-First Marketing')
            : 'Mobile-First Marketing Agency | Photography, Analytics & Ad Campaigns',
          p = d.startsWith('http') ? d : ''.concat(o).concat(d),
          f = u || ''.concat(o).concat(x),
          v = [
            'mobile marketing',
            'photography services',
            'analytics',
            'ad campaigns',
            'digital marketing',
            'mobile-first design',
            ...c,
          ].join(', '),
          b = {
            '@context': 'https://schema.org',
            '@type': m ? 'Article' : 'WebPage',
            name: g,
            description: l,
            url: f,
            image: p,
            ...(m && {
              headline: r,
              datePublished: m.publishedTime,
              dateModified: m.modifiedTime || m.publishedTime,
              author: { '@type': 'Person', name: m.author || 'Marketing Team' },
              publisher: {
                '@type': 'Organization',
                name: 'Mobile-First Marketing',
                logo: {
                  '@type': 'ImageObject',
                  url: ''.concat(o, '/images/logo.png'),
                },
              },
              articleSection: m.section,
              keywords: null == (t = m.tags) ? void 0 : t.join(', '),
            }),
          };
        return (0, s.jsxs)(i(), {
          children: [
            (0, s.jsx)('title', { children: g }),
            (0, s.jsx)('meta', { name: 'description', content: l }),
            (0, s.jsx)('meta', { name: 'keywords', content: v }),
            (0, s.jsx)('link', { rel: 'canonical', href: f }),
            h &&
              (0, s.jsx)('meta', {
                name: 'robots',
                content: 'noindex,nofollow',
              }),
            (0, s.jsx)('meta', {
              property: 'og:type',
              content: m ? 'article' : 'website',
            }),
            (0, s.jsx)('meta', { property: 'og:title', content: g }),
            (0, s.jsx)('meta', { property: 'og:description', content: l }),
            (0, s.jsx)('meta', { property: 'og:image', content: p }),
            (0, s.jsx)('meta', { property: 'og:url', content: f }),
            (0, s.jsx)('meta', {
              property: 'og:site_name',
              content: 'Mobile-First Marketing',
            }),
            (0, s.jsx)('meta', { property: 'og:locale', content: 'en_US' }),
            m &&
              (0, s.jsxs)(s.Fragment, {
                children: [
                  m.publishedTime &&
                    (0, s.jsx)('meta', {
                      property: 'article:published_time',
                      content: m.publishedTime,
                    }),
                  m.modifiedTime &&
                    (0, s.jsx)('meta', {
                      property: 'article:modified_time',
                      content: m.modifiedTime,
                    }),
                  m.author &&
                    (0, s.jsx)('meta', {
                      property: 'article:author',
                      content: m.author,
                    }),
                  m.section &&
                    (0, s.jsx)('meta', {
                      property: 'article:section',
                      content: m.section,
                    }),
                  null == (a = m.tags)
                    ? void 0
                    : a.map((e, t) =>
                        (0, s.jsx)(
                          'meta',
                          { property: 'article:tag', content: e },
                          t
                        )
                      ),
                ],
              }),
            (0, s.jsx)('meta', {
              name: 'twitter:card',
              content: 'summary_large_image',
            }),
            (0, s.jsx)('meta', { name: 'twitter:title', content: g }),
            (0, s.jsx)('meta', { name: 'twitter:description', content: l }),
            (0, s.jsx)('meta', { name: 'twitter:image', content: p }),
            (0, s.jsx)('meta', {
              name: 'viewport',
              content: 'width=device-width, initial-scale=1, maximum-scale=5',
            }),
            (0, s.jsx)('meta', { name: 'theme-color', content: '#000000' }),
            (0, s.jsx)('meta', {
              name: 'format-detection',
              content: 'telephone=no',
            }),
            (0, s.jsx)('script', {
              type: 'application/ld+json',
              dangerouslySetInnerHTML: { __html: JSON.stringify(b) },
            }),
          ],
        });
      }
    },
    1159: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => n });
      var s = a(5155),
        r = a(2115);
      a(5688);
      const i = [
          {
            id: 'scott',
            content:
              'Joe was very flexible at the JSCC Scholarships, doing various shots of the teams working on the Citroen Saxos on the paddock, drivers posing with their cars and exciting pictures of the Saxos on track.',
            author: 'Scott Beercroft',
            position: 'JSCC Day Manager and Social Media Manager',
            company: 'JSCC',
            rating: 5,
          },
          {
            id: 'lee',
            content:
              'A huge thank you! Joe Morris is a fantastic photographer from Cheshire who has been providing us with amazing images of our cars for over 18 months at LSH Auto UK!',
            author: 'Lee Murfitt',
            position: 'Lead Strategist for Digital Growth & SEO',
            company: 'SciMed',
            rating: 5,
          },
        ],
        n = e => {
          let {
              title: t = 'What Our Clients Say',
              subtitle: a = 'Trusted by businesses across Cheshire',
              autoRotate: n = !0,
              rotationInterval: o = 6e3,
            } = e,
            [l, c] = (0, r.useState)(0),
            [d, m] = (0, r.useState)(n),
            h = (0, r.useCallback)(() => {
              c(e => (e === i.length - 1 ? 0 : e + 1));
            }, []),
            u = (0, r.useCallback)(() => {
              c(e => (0 === e ? i.length - 1 : e - 1));
            }, []);
          (0, r.useEffect)(() => {
            if (!d || i.length <= 1) return;
            const e = setInterval(h, o);
            return () => clearInterval(e);
          }, [d, h, o]);
          const [x, g] = (0, r.useState)(null),
            [p, f] = (0, r.useState)(null),
            v = i[l];
          return (0, s.jsx)('section', {
            className: 'testimonials-carousel-section',
            children: (0, s.jsxs)('div', {
              className: 'testimonials-carousel-container',
              children: [
                (0, s.jsxs)('div', {
                  className: 'testimonials-carousel-header',
                  children: [
                    (0, s.jsx)('h2', {
                      className: 'testimonials-carousel-title',
                      children: t,
                    }),
                    (0, s.jsx)('p', {
                      className: 'testimonials-carousel-subtitle',
                      children: a,
                    }),
                  ],
                }),
                (0, s.jsxs)('div', {
                  className: 'testimonials-carousel-wrapper',
                  onMouseEnter: () => m(!1),
                  onMouseLeave: () => m(n),
                  onTouchStart: e => {
                    (f(null), g(e.targetTouches[0].clientX));
                  },
                  onTouchMove: e => {
                    f(e.targetTouches[0].clientX);
                  },
                  onTouchEnd: () => {
                    if (!x || !p) return;
                    const e = x - p;
                    e > 50 ? h() : e < -50 && u();
                  },
                  children: [
                    (0, s.jsx)('button', {
                      onClick: u,
                      className:
                        'testimonials-carousel-nav testimonials-carousel-nav-prev',
                      'aria-label': 'Previous testimonial',
                      children: (0, s.jsx)('svg', {
                        className: 'testimonials-carousel-nav-icon',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        children: (0, s.jsx)('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M15 19l-7-7 7-7',
                        }),
                      }),
                    }),
                    (0, s.jsxs)('div', {
                      className: 'testimonials-carousel-card',
                      children: [
                        (0, s.jsx)('div', {
                          className: 'testimonials-carousel-stars',
                          children: [
                            void 0,
                            void 0,
                            void 0,
                            void 0,
                            void 0,
                          ].map((e, t) =>
                            (0, s.jsx)(
                              'svg',
                              {
                                className: 'testimonials-carousel-star '.concat(
                                  t < v.rating ? 'active' : ''
                                ),
                                fill: 'currentColor',
                                viewBox: '0 0 20 20',
                                children: (0, s.jsx)('path', {
                                  d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z',
                                }),
                              },
                              t
                            )
                          ),
                        }),
                        (0, s.jsxs)('blockquote', {
                          className: 'testimonials-carousel-quote',
                          children: ['"', v.content, '"'],
                        }),
                        (0, s.jsxs)('div', {
                          className: 'testimonials-carousel-author',
                          children: [
                            (0, s.jsx)('h4', {
                              className: 'testimonials-carousel-author-name',
                              children: v.author,
                            }),
                            (0, s.jsx)('p', {
                              className:
                                'testimonials-carousel-author-position',
                              children: v.position,
                            }),
                            (0, s.jsx)('p', {
                              className: 'testimonials-carousel-author-company',
                              children: v.company,
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, s.jsx)('button', {
                      onClick: h,
                      className:
                        'testimonials-carousel-nav testimonials-carousel-nav-next',
                      'aria-label': 'Next testimonial',
                      children: (0, s.jsx)('svg', {
                        className: 'testimonials-carousel-nav-icon',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        children: (0, s.jsx)('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          strokeWidth: 2,
                          d: 'M9 5l7 7-7 7',
                        }),
                      }),
                    }),
                  ],
                }),
                (0, s.jsx)('div', {
                  className: 'testimonials-carousel-dots',
                  children: i.map((e, t) =>
                    (0, s.jsx)(
                      'button',
                      {
                        onClick: () => {
                          c(t);
                        },
                        className: 'testimonials-carousel-dot '.concat(
                          t === l ? 'active' : ''
                        ),
                        'aria-label': 'Go to testimonial '.concat(t + 1),
                      },
                      t
                    )
                  ),
                }),
                (0, s.jsxs)('div', {
                  className: 'testimonials-carousel-cta',
                  children: [
                    (0, s.jsx)('p', {
                      className: 'testimonials-carousel-cta-text',
                      children: 'Ready to work with us?',
                    }),
                    (0, s.jsx)('button', {
                      className: 'testimonials-cta-button',
                      children: 'Get In Touch',
                    }),
                  ],
                }),
              ],
            }),
          });
        };
    },
    1265: (e, t, a) => {
      'use strict';
      a.d(t, { MobileMenu: () => o });
      var s = a(5155),
        r = a(2115),
        i = a(2619),
        n = a.n(i);
      function o(e) {
        const { isOpen: t, onClose: a, navigationItems: i, currentPath: o } = e;
        return ((0, r.useEffect)(() => {
          const e = e => {
            'Escape' === e.key && a();
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
        }, [t, a]),
        t)
          ? (0, s.jsxs)(s.Fragment, {
              children: [
                (0, s.jsx)('div', {
                  className:
                    'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden',
                  onClick: a,
                  'aria-hidden': 'true',
                }),
                (0, s.jsxs)('div', {
                  className:
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden '.concat(
                      t ? 'translate-x-0' : 'translate-x-full'
                    ),
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': 'Mobile navigation menu',
                  children: [
                    (0, s.jsxs)('div', {
                      className:
                        'flex items-center justify-between p-4 border-b border-gray-200',
                      children: [
                        (0, s.jsx)('h2', {
                          className: 'text-lg font-semibold text-gray-900',
                          children: 'Menu',
                        }),
                        (0, s.jsx)('button', {
                          onClick: a,
                          className:
                            'p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                          'aria-label': 'Close menu',
                          children: (0, s.jsx)('svg', {
                            className: 'w-6 h-6',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            'aria-hidden': 'true',
                            children: (0, s.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, s.jsx)('nav', {
                      className: 'flex flex-col p-4 space-y-2',
                      role: 'navigation',
                      children: i.map(e =>
                        (0, s.jsx)(
                          n(),
                          {
                            href: e.href,
                            className:
                              'flex items-center px-4 py-3 rounded-lg text-base font-medium transition-colors min-h-[48px] '.concat(
                                o === e.href
                                  ? 'border-l-4'
                                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              ),
                            style:
                              o === e.href
                                ? {
                                    backgroundColor: 'rgba(245, 39, 111, 0.1)',
                                    color: '#F5276F',
                                    borderLeftColor: '#F5276F',
                                  }
                                : {},
                            'aria-current': o === e.href ? 'page' : void 0,
                            children: e.label,
                          },
                          e.href
                        )
                      ),
                    }),
                    (0, s.jsx)('div', {
                      className:
                        'absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50',
                      children: (0, s.jsx)(n(), {
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
    2548: (e, t, a) => {
      'use strict';
      (a.r(t), a.d(t, { default: () => l }));
      var s = a(5155),
        r = a(2115),
        i = a(5239),
        n = a(1029).hp;
      const o = function () {
          const e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : 10,
            t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 10;
          return 'data:image/svg+xml;base64,'.concat(
            n
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
              alt: a,
              width: n,
              height: l,
              priority: c = !1,
              mobileBreakpoint: d = 768,
              className: m = '',
              fill: h = !1,
              sizes: u,
              quality: x = 85,
              placeholder: g = 'blur',
              blurDataURL: p,
              objectFit: f = 'cover',
              loading: v = 'lazy',
              onLoad: b,
              onError: y,
              title: j,
              caption: w,
              figureClassName: N = '',
              includeStructuredData: k = !1,
              fallbackSrc: M,
              maxRetries: S = 2,
              retryDelay: C = 1e3,
              showErrorMessage: L = !0,
              errorMessage: P = 'Image failed to load',
              showLoadingIndicator: T = !0,
              loadingComponent: F,
              errorComponent: _,
            } = e,
            [z, O] = (0, r.useState)(!1),
            [E, A] = (0, r.useState)(!0),
            [B, W] = (0, r.useState)(!1),
            [I, H] = (0, r.useState)(t),
            [V, D] = (0, r.useState)(0),
            [U, J] = (0, r.useState)(''),
            G = p || o(n || 400, l || 300);
          (0, r.useEffect)(() => {
            (O(!1), A(!0), W(!1), H(t), D(0), J(''));
          }, [t]);
          const q = k
              ? {
                  '@context': 'https://schema.org',
                  '@type': 'ImageObject',
                  url: t,
                  description: a,
                  width: null == n ? void 0 : n.toString(),
                  height: null == l ? void 0 : l.toString(),
                  ...(w && { caption: w }),
                }
              : null,
            R = {
              src: I,
              alt: a,
              title: j || a,
              priority: c || 'eager' === v,
              quality: x,
              className: ''
                .concat(m, ' transition-all duration-500 ')
                .concat(z ? 'opacity-100 scale-100' : 'opacity-0 scale-105'),
              sizes:
                u ||
                '(max-width: '.concat(
                  d,
                  'px) 100vw, (max-width: 1024px) 50vw, 33vw'
                ),
              placeholder: g,
              blurDataURL: 'blur' === g ? G : void 0,
              onLoad: () => {
                (O(!0), A(!1), W(!1), null == b || b());
              },
              onError: e => {
                if (
                  (J('Failed to load image: '.concat(I)), A(!1), M && I !== M)
                ) {
                  (H(M), D(0), A(!0));
                  return;
                }
                if (V < S) {
                  const e = V + 1;
                  setTimeout(() => {
                    (D(e),
                      A(!0),
                      W(!1),
                      H(
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
              style: { objectFit: f },
              key: ''.concat(I, '-').concat(V),
            };
          if (E && T && !z)
            return (
              F ||
              (0, s.jsx)('div', {
                className: ''.concat(
                  m,
                  ' bg-gray-100 flex items-center justify-center animate-pulse'
                ),
                style: { width: h ? '100%' : n, height: h ? '100%' : l },
                children: (0, s.jsxs)('div', {
                  className: 'flex flex-col items-center space-y-2',
                  children: [
                    (0, s.jsx)('div', {
                      className:
                        'w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin',
                    }),
                    (0, s.jsx)('span', {
                      className: 'text-xs text-gray-500',
                      children: 'Loading image...',
                    }),
                    V > 0 &&
                      (0, s.jsxs)('span', {
                        className: 'text-xs text-gray-400',
                        children: ['Retry ', V, '/', S],
                      }),
                  ],
                }),
              })
            );
          if (B)
            return (
              _ ||
              (0, s.jsx)('div', {
                className: ''.concat(
                  m,
                  ' bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center text-red-600 text-sm p-4'
                ),
                style: { width: h ? '100%' : n, height: h ? '100%' : l },
                role: 'img',
                'aria-label': 'Failed to load image: '.concat(a),
                children: (0, s.jsxs)('div', {
                  className: 'flex flex-col items-center space-y-2 text-center',
                  children: [
                    (0, s.jsx)('svg', {
                      className: 'w-8 h-8 text-red-400',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      'aria-hidden': 'true',
                      children: (0, s.jsx)('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
                      }),
                    }),
                    L &&
                      (0, s.jsxs)(s.Fragment, {
                        children: [
                          (0, s.jsx)('span', {
                            className: 'font-medium',
                            children: P,
                          }),
                          (0, s.jsx)('span', {
                            className:
                              'text-xs text-red-500 max-w-full break-words',
                            children: a,
                          }),
                          !1,
                        ],
                      }),
                  ],
                }),
              })
            );
          const K = () => {
            if (h)
              return (0, s.jsx)('div', {
                className: 'relative overflow-hidden',
                children: (0, s.jsx)(i.default, { ...R, fill: !0 }),
              });
            if (!n || !l)
              throw Error('Width and height are required when fill is false');
            return (0, s.jsx)(i.default, { ...R, width: n, height: l });
          };
          return w
            ? (0, s.jsxs)(s.Fragment, {
                children: [
                  q &&
                    (0, s.jsx)('script', {
                      type: 'application/ld+json',
                      dangerouslySetInnerHTML: { __html: JSON.stringify(q) },
                    }),
                  (0, s.jsxs)('figure', {
                    className: ''.concat(N),
                    itemScope: !0,
                    itemType: 'https://schema.org/ImageObject',
                    children: [
                      K(),
                      (0, s.jsx)('figcaption', {
                        className: 'text-sm text-gray-600 mt-2 italic',
                        itemProp: 'caption',
                        children: w,
                      }),
                      (0, s.jsx)('meta', { itemProp: 'url', content: t }),
                      (0, s.jsx)('meta', {
                        itemProp: 'description',
                        content: a,
                      }),
                      n &&
                        (0, s.jsx)('meta', {
                          itemProp: 'width',
                          content: n.toString(),
                        }),
                      l &&
                        (0, s.jsx)('meta', {
                          itemProp: 'height',
                          content: l.toString(),
                        }),
                    ],
                  }),
                ],
              })
            : (0, s.jsxs)(s.Fragment, {
                children: [
                  q &&
                    (0, s.jsx)('script', {
                      type: 'application/ld+json',
                      dangerouslySetInnerHTML: { __html: JSON.stringify(q) },
                    }),
                  K(),
                ],
              });
        };
    },
    2685: (e, t, a) => {
      (Promise.resolve().then(a.t.bind(a, 2619, 23)),
        Promise.resolve().then(a.t.bind(a, 1356, 23)),
        Promise.resolve().then(a.bind(a, 5481)),
        Promise.resolve().then(a.bind(a, 5545)),
        Promise.resolve().then(a.bind(a, 1265)),
        Promise.resolve().then(a.bind(a, 2854)),
        Promise.resolve().then(a.bind(a, 3035)),
        Promise.resolve().then(a.bind(a, 740)),
        Promise.resolve().then(a.bind(a, 5370)),
        Promise.resolve().then(a.bind(a, 1159)),
        Promise.resolve().then(a.bind(a, 2548)));
    },
    2854: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => m });
      var s = a(5155),
        r = a(2115),
        i = a(2619),
        n = a.n(i),
        o = a(2548);
      const l = r.forwardRef((e, t) => {
        let {
            children: a,
            variant: r = 'primary',
            size: i = 'md',
            href: o,
            onClick: l,
            className: c = '',
            disabled: d = !1,
            type: m = 'button',
          } = e,
          h = ''
            .concat(
              'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
              ' '
            )
            .concat(
              {
                primary:
                  'text-white hover:opacity-90 focus:ring-offset-2 active:opacity-95',
                secondary:
                  'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
                outline:
                  'border-2 text-white hover:opacity-90 focus:ring-offset-2 active:opacity-95',
                ghost:
                  'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 active:bg-gray-200',
              }[r],
              ' '
            )
            .concat(
              {
                sm: 'px-3 py-2 text-sm min-h-[36px]',
                md: 'px-4 py-2 text-base min-h-[40px]',
                lg: 'px-6 py-3 text-lg min-h-[44px]',
                icon: 'p-2 min-h-[44px] min-w-[44px]',
              }[i],
              ' '
            )
            .concat(
              'primary' === r
                ? 'brand-button-primary'
                : 'outline' === r
                  ? 'brand-button-outline'
                  : '',
              ' '
            )
            .concat(c);
        return o
          ? (0, s.jsx)(n(), { href: o, className: h, children: a })
          : (0, s.jsx)('button', {
              ref: t,
              type: m,
              onClick: l,
              disabled: d,
              className: h,
              children: a,
            });
      });
      l.displayName = 'Button';
      const c = e => {
          const {
            className: t = '',
            title: a = 'Click-through rate',
            metric: r = '2.9%',
            value: i = '446',
            change: n = '+15.2%',
            data: o = [
              420, 520, 480, 580, 620, 580, 480, 380, 420, 480, 520, 580, 620,
              580, 520, 480, 520, 580, 620, 580, 520, 480, 420, 380,
            ],
          } = e;
          return (0, s.jsxs)('div', {
            className: 'bg-white p-6 rounded-lg '.concat(t),
            children: [
              (0, s.jsxs)('div', {
                className: 'flex justify-between items-start mb-4',
                children: [
                  (0, s.jsxs)('div', {
                    children: [
                      (0, s.jsx)('div', {
                        className: 'text-2xl font-bold text-gray-900',
                        children: r,
                      }),
                      (0, s.jsx)('div', {
                        className: 'text-sm text-gray-600',
                        children: a,
                      }),
                      (0, s.jsx)('div', {
                        className: 'text-xs text-gray-500 mt-1',
                        children:
                          'The percentage of people who clicked on your ads after viewing them.',
                      }),
                    ],
                  }),
                  (0, s.jsxs)('div', {
                    className: 'text-right',
                    children: [
                      (0, s.jsx)('div', {
                        className: 'text-sm text-gray-600',
                        children: 'Total clicks',
                      }),
                      (0, s.jsx)('div', {
                        className: 'text-lg font-semibold text-gray-900',
                        children: i,
                      }),
                      (0, s.jsx)('div', {
                        className: 'text-xs text-green-600 font-medium',
                        children: n,
                      }),
                    ],
                  }),
                ],
              }),
              (0, s.jsxs)('div', {
                className: 'relative',
                children: [
                  (0, s.jsxs)('svg', {
                    width: '300',
                    height: '120',
                    className: 'w-full h-auto',
                    children: [
                      (0, s.jsx)('defs', {
                        children: (0, s.jsx)('pattern', {
                          id: 'grid',
                          width: '30',
                          height: '24',
                          patternUnits: 'userSpaceOnUse',
                          children: (0, s.jsx)('path', {
                            d: 'M 30 0 L 0 0 0 24',
                            fill: 'none',
                            stroke: '#f3f4f6',
                            strokeWidth: '1',
                          }),
                        }),
                      }),
                      (0, s.jsx)('rect', {
                        width: '100%',
                        height: '100%',
                        fill: 'url(#grid)',
                      }),
                      (0, s.jsx)('path', {
                        d: (e => {
                          let t = Math.max(...e),
                            a = Math.min(...e),
                            s = t - a,
                            r = 260 / (e.length - 1),
                            i = '';
                          return (
                            e.forEach((e, t) => {
                              const n = 20 + t * r,
                                o = 100 - ((e - a) / s) * 80;
                              0 === t
                                ? (i += 'M '.concat(n, ' ').concat(o))
                                : (i += ' L '.concat(n, ' ').concat(o));
                            }),
                            i
                          );
                        })(o),
                        fill: 'none',
                        stroke: '#6366f1',
                        strokeWidth: '2',
                        className: 'drop-shadow-sm',
                      }),
                      o.map((e, t) => {
                        const a = Math.max(...o),
                          r = Math.min(...o),
                          i = 260 / (o.length - 1);
                        return (0, s.jsx)(
                          'circle',
                          {
                            cx: 20 + t * i,
                            cy: 100 - ((e - r) / (a - r)) * 80,
                            r: '2',
                            fill: '#6366f1',
                            className: 'opacity-60',
                          },
                          t
                        );
                      }),
                    ],
                  }),
                  (0, s.jsxs)('div', {
                    className:
                      'flex justify-between text-xs text-gray-400 mt-2',
                    children: [
                      (0, s.jsx)('span', { children: '7/1' }),
                      (0, s.jsx)('span', { children: '7/8' }),
                      (0, s.jsx)('span', { children: '7/15' }),
                      (0, s.jsx)('span', { children: '7/22' }),
                      (0, s.jsx)('span', { children: '7/29' }),
                      (0, s.jsx)('span', { children: '8/5' }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
        d = e => {
          let { post: t } = e,
            [a, i] = (0, r.useState)(!1),
            [d, m] = (0, r.useState)(!0),
            [h, u] = (0, r.useState)(0),
            x = () => {
              (m(!1), i(!1));
            },
            g = () => {
              h < 2
                ? (u(e => e + 1),
                  setTimeout(() => {
                    (m(!0), i(!1));
                  }, 1e3))
                : (i(!0), m(!1));
            };
          return (0, s.jsxs)('article', {
            className:
              'bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100',
            children: [
              (0, s.jsxs)('div', {
                className: 'relative h-48 sm:h-52 bg-gray-50 overflow-hidden',
                children: [
                  (0, s.jsx)('div', {
                    className: 'absolute inset-0',
                    children: (() => {
                      var e;
                      return t.image && !a
                        ? (0, s.jsxs)('div', {
                            className: 'relative w-full h-full overflow-hidden',
                            children: [
                              d &&
                                (0, s.jsx)('div', {
                                  className:
                                    'absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10',
                                  children: (0, s.jsx)('div', {
                                    className: 'text-gray-400 text-sm',
                                    children: 'Loading image...',
                                  }),
                                }),
                              (0, s.jsx)(
                                o.default,
                                {
                                  src: t.image,
                                  alt: 'Featured image for '.concat(t.title),
                                  fill: !0,
                                  className:
                                    'object-cover group-hover:scale-105 transition-transform duration-300',
                                  onLoad: x,
                                  onError: g,
                                  priority: !1,
                                  quality: 85,
                                  sizes:
                                    '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
                                  placeholder: 'blur',
                                },
                                ''.concat(t.slug, '-image-').concat(h)
                              ),
                            ],
                          })
                        : (
                              null == (e = t.tags)
                                ? void 0
                                : e.some(e =>
                                    [
                                      'analytics',
                                      'campaigns',
                                      'paid-ads',
                                      'data-driven',
                                      'meta-ads',
                                      'google-ads',
                                    ].includes(e)
                                  )
                            )
                          ? (0, s.jsx)('div', {
                              className:
                                'w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50',
                              children: (0, s.jsx)(c, {
                                className:
                                  'w-full max-w-sm scale-75 sm:scale-90',
                                title: 'Campaign Performance',
                                metric: '2.9%',
                                value: '446',
                                change: '+15.2%',
                              }),
                            })
                          : (0, s.jsx)('div', {
                              className:
                                'w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center',
                              children: (0, s.jsxs)('div', {
                                className: 'text-center',
                                children: [
                                  (0, s.jsx)('div', {
                                    className: 'text-4xl text-gray-400 mb-2',
                                    children: '\uD83D\uDCCA',
                                  }),
                                  (0, s.jsx)('div', {
                                    className: 'text-sm text-gray-500',
                                    children: 'Blog Post',
                                  }),
                                ],
                              }),
                            });
                    })(),
                  }),
                  (0, s.jsxs)('div', {
                    className:
                      'absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-sm font-medium shadow-sm z-20',
                    children: [
                      t.readTime ||
                        Math.ceil(t.content.split(/\s+/).length / 200),
                      ' min read',
                    ],
                  }),
                ],
              }),
              (0, s.jsxs)('div', {
                className: 'p-6',
                children: [
                  (0, s.jsx)('h3', {
                    className:
                      'text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors',
                    children: (0, s.jsx)(n(), {
                      href: '/blog/'.concat(t.slug),
                      className: 'hover:underline',
                      children: t.title,
                    }),
                  }),
                  (0, s.jsx)('p', {
                    className:
                      'text-gray-600 mb-6 leading-relaxed line-clamp-3',
                    children: t.excerpt,
                  }),
                  (0, s.jsxs)('div', {
                    className: 'mb-6',
                    children: [
                      (0, s.jsx)('h4', {
                        className: 'text-sm font-semibold text-gray-900 mb-3',
                        children: 'Key Topics:',
                      }),
                      (0, s.jsxs)('div', {
                        className: 'space-y-2',
                        children: [
                          t.tags &&
                            t.tags.slice(0, 3).map(e =>
                              (0, s.jsxs)(
                                'div',
                                {
                                  className:
                                    'flex items-center text-sm text-gray-600',
                                  children: [
                                    (0, s.jsx)('div', {
                                      className:
                                        'w-2 h-2 bg-pink-500 rounded-full mr-3',
                                    }),
                                    (0, s.jsx)('span', {
                                      className: 'capitalize',
                                      children: e.replace('-', ' '),
                                    }),
                                  ],
                                },
                                e
                              )
                            ),
                          t.tags &&
                            t.tags.length > 3 &&
                            (0, s.jsxs)('div', {
                              className:
                                'flex items-center text-sm text-gray-500 italic',
                              children: [
                                (0, s.jsx)('div', {
                                  className:
                                    'w-2 h-2 bg-gray-300 rounded-full mr-3',
                                }),
                                (0, s.jsxs)('span', {
                                  children: [
                                    '+',
                                    t.tags.length - 3,
                                    ' more insights',
                                  ],
                                }),
                              ],
                            }),
                        ],
                      }),
                    ],
                  }),
                  (0, s.jsxs)('div', {
                    className: 'space-y-3',
                    children: [
                      (0, s.jsx)(l, {
                        href: '/blog/'.concat(t.slug),
                        variant: 'primary',
                        size: 'md',
                        className:
                          'w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-xl',
                        children: 'Read Article',
                      }),
                      (0, s.jsxs)('div', {
                        className:
                          'flex items-center justify-between text-sm text-gray-500 pt-2 border-t border-gray-100',
                        children: [
                          (0, s.jsxs)('span', { children: ['By ', t.author] }),
                          (0, s.jsx)('time', {
                            dateTime: t.date,
                            children: new Date(t.date).toLocaleDateString(
                              'en-US',
                              { year: 'numeric', month: 'long', day: 'numeric' }
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        },
        m = e => {
          const {
            posts: t,
            title: a = 'Latest Insights',
            subtitle:
              r = 'Stay updated with our latest thoughts and industry insights',
            showViewAll: i = !0,
          } = e;
          return 0 === t.length
            ? null
            : (0, s.jsx)('section', {
                className: 'py-16 sm:py-20 bg-gray-50',
                children: (0, s.jsxs)('div', {
                  className: 'container mx-auto px-4',
                  children: [
                    (0, s.jsxs)('div', {
                      className: 'text-center mb-12 sm:mb-16',
                      children: [
                        (0, s.jsx)('h2', {
                          className:
                            'text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4',
                          children: a,
                        }),
                        (0, s.jsx)('p', {
                          className:
                            'text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto',
                          children: r,
                        }),
                      ],
                    }),
                    (0, s.jsx)('div', {
                      className:
                        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12',
                      children: t.map(e => (0, s.jsx)(d, { post: e }, e.slug)),
                    }),
                    i &&
                      (0, s.jsx)('div', {
                        className: 'text-center',
                        children: (0, s.jsx)(l, {
                          href: '/blog',
                          variant: 'outline',
                          size: 'lg',
                          className: 'min-w-[200px]',
                          children: 'View All Posts',
                        }),
                      }),
                  ],
                }),
              });
        };
    },
    3035: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => i });
      var s = a(5155),
        r = a(63);
      function i(e) {
        let { canonicalUrl: t, supportedLocales: a = ['en'] } = e,
          i = (0, r.usePathname)(),
          n =
            t ||
            (function (e) {
              let {
                  path: t,
                  removeTrailingSlash: a = !0,
                  removeQueryParams: s = !0,
                } = e,
                r = t;
              return (
                s && r.includes('?') && (r = r.split('?')[0]),
                a && '/' !== r && r.endsWith('/') && (r = r.slice(0, -1)),
                r.startsWith('/') || (r = '/'.concat(r)),
                ''.concat('http://localhost:3000').concat(r)
              );
            })({ path: i }),
          o = (function (e) {
            const t =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : ['en'];
            return t.map(t => ({
              hreflang: t,
              href: ''
                .concat('http://localhost:3000')
                .concat('en' === t ? '' : '/'.concat(t))
                .concat(e),
            }));
          })(i, a);
        return (0, s.jsxs)(s.Fragment, {
          children: [
            (0, s.jsx)('link', { rel: 'canonical', href: n }),
            o.map(e =>
              (0, s.jsx)(
                'link',
                { rel: 'alternate', hrefLang: e.hreflang, href: e.href },
                e.hreflang
              )
            ),
            (0, s.jsx)('link', {
              rel: 'alternate',
              hrefLang: 'x-default',
              href: n,
            }),
          ],
        });
      }
    },
    5370: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => n });
      var s = a(5155),
        r = a(63);
      const i = 'http://localhost:3000';
      function n(e) {
        let t,
          { type: a = 'organization', data: n } = e;
        switch (((0, r.usePathname)(), a)) {
          case 'organization':
          default:
            t = {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mobile-First Vivid Auto Photography',
              description:
                'Professional Vivid Auto Photography services with mobile-first approach specializing in photography, analytics, and ad campaigns.',
              url: i,
              logo: ''.concat(i, '/images/logo.png'),
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+1-555-0123',
                email: 'contact@mobilefirstvividautophotography.com',
                contactType: 'Customer Service',
                areaServed: 'US',
                availableLanguage: 'English',
              },
              address: {
                '@type': 'PostalAddress',
                streetAddress: '123 Vivid Auto Photography Street',
                addressLocality: 'Digital City',
                addressRegion: 'CA',
                postalCode: '90210',
                addressCountry: 'US',
              },
              sameAs: [
                'https://facebook.com/mobilefirstvividautophotography',
                'https://twitter.com/mobilefirstvap',
                'https://linkedin.com/company/mobile-first-vivid-auto-photography',
                'https://instagram.com/mobilefirstmarketing',
              ],
              foundingDate: '2020',
              numberOfEmployees: '10-50',
              slogan: 'Mobile-First Marketing Solutions',
            };
            break;
          case 'website':
            t = {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Mobile-First Marketing',
              url: i,
              description:
                'Professional marketing services with mobile-first approach.',
              publisher: {
                '@type': 'Organization',
                name: 'Mobile-First Marketing',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: ''.concat(
                    i,
                    '/blog?search={search_term_string}'
                  ),
                },
                'query-input': 'required name=search_term_string',
              },
            };
            break;
          case 'service':
            t = {
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: n.name || 'Marketing Service',
              description: n.description || 'Professional marketing service',
              provider: {
                '@type': 'Organization',
                name: 'Mobile-First Marketing',
                url: i,
              },
              areaServed: 'United States',
              serviceType: n.serviceType || 'Marketing',
              category: 'Digital Marketing',
              offers: {
                '@type': 'Offer',
                availability: 'https://schema.org/InStock',
                priceCurrency: 'USD',
              },
            };
            break;
          case 'breadcrumb':
            t = {
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: n.map((e, t) => ({
                '@type': 'ListItem',
                position: t + 1,
                name: e.name,
                item: e.url,
              })),
            };
        }
        return (0, s.jsx)('script', {
          type: 'application/ld+json',
          dangerouslySetInnerHTML: { __html: JSON.stringify(t) },
        });
      }
    },
    5481: (e, t, a) => {
      'use strict';
      (a.r(t), a.d(t, { BottomNavigation: () => l }));
      var s = a(5155);
      a(2115);
      var r = a(2619),
        i = a.n(r),
        n = a(63);
      const o = [
        {
          label: 'Home',
          href: '/',
          icon: (0, s.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, s.jsx)('path', {
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
          icon: (0, s.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, s.jsx)('path', {
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
          icon: (0, s.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, s.jsx)('path', {
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
          icon: (0, s.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, s.jsx)('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            }),
          }),
        },
      ];
      function l() {
        const e = (0, n.usePathname)();
        return (0, s.jsx)('nav', {
          className:
            'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40',
          role: 'navigation',
          'aria-label': 'Bottom navigation',
          children: (0, s.jsx)('div', {
            className: 'flex items-center justify-around px-2 py-1',
            children: o.map(t => {
              const a = e === t.href;
              return (0, s.jsxs)(
                i(),
                {
                  href: t.href,
                  className:
                    'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-[64px] min-h-[56px] '.concat(
                      a
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    ),
                  'aria-current': a ? 'page' : void 0,
                  children: [
                    (0, s.jsx)('div', {
                      className: 'transition-transform '.concat(
                        a ? 'scale-110' : ''
                      ),
                      children: t.icon,
                    }),
                    (0, s.jsx)('span', {
                      className: 'text-xs font-medium mt-1 '.concat(
                        a ? 'font-semibold' : ''
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
    5545: (e, t, a) => {
      'use strict';
      (a.r(t), a.d(t, { Header: () => d }));
      var s = a(5155),
        r = a(2115),
        i = a(2619),
        n = a.n(i),
        o = a(63),
        l = a(1265);
      const c = [
        { label: 'Home', href: '/' },
        { label: 'Services', href: '/services' },
        { label: 'Blog', href: '/blog' },
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ];
      function d(e) {
        let { pageTitle: t } = e,
          [a, i] = (0, r.useState)(!1),
          d = (0, o.usePathname)();
        return (0, s.jsxs)(s.Fragment, {
          children: [
            (0, s.jsx)('header', {
              className:
                'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm',
              children: (0, s.jsx)('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                children: (0, s.jsxs)('div', {
                  className: 'flex justify-between items-center h-16 md:h-20',
                  children: [
                    (0, s.jsx)(n(), {
                      href: '/',
                      className:
                        'flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors',
                      'aria-label': 'Go to homepage',
                      children: (0, s.jsx)('img', {
                        src: '/images/icons/Vivid Auto Photography Logo.png',
                        alt: 'Vivid Auto Photography Logo',
                        className: 'w-48 h-48 object-contain',
                        width: 192,
                        height: 192,
                      }),
                    }),
                    (0, s.jsx)('nav', {
                      className:
                        'hidden md:flex items-center space-x-6 lg:space-x-8',
                      role: 'navigation',
                      children: c.map(e =>
                        (0, s.jsx)(
                          n(),
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
                    (0, s.jsx)('div', {
                      className: 'hidden md:flex items-center space-x-4',
                      children: (0, s.jsx)(n(), {
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
                    (0, s.jsx)('button', {
                      onClick: () => {
                        i(!a);
                      },
                      className:
                        'md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'aria-label': 'Toggle mobile menu',
                      'aria-expanded': a,
                      children: (0, s.jsx)('svg', {
                        className: 'w-6 h-6',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        'aria-hidden': 'true',
                        children: a
                          ? (0, s.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            })
                          : (0, s.jsx)('path', {
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
            (0, s.jsx)(l.MobileMenu, {
              isOpen: a,
              onClose: () => {
                i(!1);
              },
              navigationItems: c,
              currentPath: d,
            }),
          ],
        });
      }
    },
    5688: () => {},
    7127: (e, t) => {
      'use strict';
      function a() {
        return null;
      }
      (Object.defineProperty(t, '__esModule', { value: !0 }),
        Object.defineProperty(t, 'default', {
          enumerable: !0,
          get: function () {
            return a;
          },
        }),
        ('function' == typeof t.default ||
          ('object' == typeof t.default && null !== t.default)) &&
          void 0 === t.default.__esModule &&
          (Object.defineProperty(t.default, '__esModule', { value: !0 }),
          Object.assign(t.default, t),
          (e.exports = t.default)));
    },
  },
  e => {
    (e.O(0, [963, 619, 851, 441, 255, 358], () => e((e.s = 2685))),
      (_N_E = e.O()));
  },
]);

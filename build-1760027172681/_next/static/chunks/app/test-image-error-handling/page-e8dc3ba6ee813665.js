(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [710],
  {
    2548: (e, s, t) => {
      'use strict';
      (t.r(s), t.d(s, { default: () => o }));
      var r = t(5155),
        l = t(2115),
        a = t(5239),
        i = t(1029).hp;
      const n = function () {
          const e =
              arguments.length > 0 && void 0 !== arguments[0]
                ? arguments[0]
                : 10,
            s =
              arguments.length > 1 && void 0 !== arguments[1]
                ? arguments[1]
                : 10;
          return 'data:image/svg+xml;base64,'.concat(
            i
              .from(
                '<svg width="'
                  .concat(e, '" height="')
                  .concat(
                    s,
                    '" xmlns="http://www.w3.org/2000/svg">\n      <defs>\n        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">\n          <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />\n          <stop offset="50%" style="stop-color:#e5e7eb;stop-opacity:1" />\n          <stop offset="100%" style="stop-color:#d1d5db;stop-opacity:1" />\n        </linearGradient>\n      </defs>\n      <rect width="100%" height="100%" fill="url(#grad)" />\n    </svg>'
                  )
              )
              .toString('base64')
          );
        },
        o = e => {
          let {
              src: s,
              alt: t,
              width: i,
              height: o,
              priority: d = !1,
              mobileBreakpoint: c = 768,
              className: h = '',
              fill: m = !1,
              sizes: u,
              quality: x = 85,
              placeholder: g = 'blur',
              blurDataURL: p,
              objectFit: j = 'cover',
              loading: f = 'lazy',
              onLoad: b,
              onError: N,
              title: y,
              caption: v,
              figureClassName: w = '',
              includeStructuredData: S = !1,
              fallbackSrc: k,
              maxRetries: C = 2,
              retryDelay: T = 1e3,
              showErrorMessage: _ = !0,
              errorMessage: E = 'Image failed to load',
              showLoadingIndicator: L = !0,
              loadingComponent: I,
              errorComponent: M,
            } = e,
            [O, F] = (0, l.useState)(!1),
            [D, P] = (0, l.useState)(!0),
            [R, B] = (0, l.useState)(!1),
            [W, z] = (0, l.useState)(s),
            [H, G] = (0, l.useState)(0),
            [J, q] = (0, l.useState)(''),
            A = p || n(i || 400, o || 300);
          (0, l.useEffect)(() => {
            (F(!1), P(!0), B(!1), z(s), G(0), q(''));
          }, [s]);
          const U = S
              ? {
                  '@context': 'https://schema.org',
                  '@type': 'ImageObject',
                  url: s,
                  description: t,
                  width: null == i ? void 0 : i.toString(),
                  height: null == o ? void 0 : o.toString(),
                  ...(v && { caption: v }),
                }
              : null,
            K = {
              src: W,
              alt: t,
              title: y || t,
              priority: d || 'eager' === f,
              quality: x,
              className: ''
                .concat(h, ' transition-all duration-500 ')
                .concat(O ? 'opacity-100 scale-100' : 'opacity-0 scale-105'),
              sizes:
                u ||
                '(max-width: '.concat(
                  c,
                  'px) 100vw, (max-width: 1024px) 50vw, 33vw'
                ),
              placeholder: g,
              blurDataURL: 'blur' === g ? A : void 0,
              onLoad: () => {
                (F(!0), P(!1), B(!1), null == b || b());
              },
              onError: e => {
                if (
                  (q('Failed to load image: '.concat(W)), P(!1), k && W !== k)
                ) {
                  (z(k), G(0), P(!0));
                  return;
                }
                if (H < C) {
                  const e = H + 1;
                  setTimeout(() => {
                    (G(e),
                      P(!0),
                      B(!1),
                      z(
                        ''
                          .concat(s, '?retry=')
                          .concat(e, '&t=')
                          .concat(Date.now())
                      ));
                  }, T);
                  return;
                }
                (B(!0), null == N || N());
              },
              style: { objectFit: j },
              key: ''.concat(W, '-').concat(H),
            };
          if (D && L && !O)
            return (
              I ||
              (0, r.jsx)('div', {
                className: ''.concat(
                  h,
                  ' bg-gray-100 flex items-center justify-center animate-pulse'
                ),
                style: { width: m ? '100%' : i, height: m ? '100%' : o },
                children: (0, r.jsxs)('div', {
                  className: 'flex flex-col items-center space-y-2',
                  children: [
                    (0, r.jsx)('div', {
                      className:
                        'w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin',
                    }),
                    (0, r.jsx)('span', {
                      className: 'text-xs text-gray-500',
                      children: 'Loading image...',
                    }),
                    H > 0 &&
                      (0, r.jsxs)('span', {
                        className: 'text-xs text-gray-400',
                        children: ['Retry ', H, '/', C],
                      }),
                  ],
                }),
              })
            );
          if (R)
            return (
              M ||
              (0, r.jsx)('div', {
                className: ''.concat(
                  h,
                  ' bg-red-50 border-2 border-red-200 flex flex-col items-center justify-center text-red-600 text-sm p-4'
                ),
                style: { width: m ? '100%' : i, height: m ? '100%' : o },
                role: 'img',
                'aria-label': 'Failed to load image: '.concat(t),
                children: (0, r.jsxs)('div', {
                  className: 'flex flex-col items-center space-y-2 text-center',
                  children: [
                    (0, r.jsx)('svg', {
                      className: 'w-8 h-8 text-red-400',
                      fill: 'none',
                      stroke: 'currentColor',
                      viewBox: '0 0 24 24',
                      'aria-hidden': 'true',
                      children: (0, r.jsx)('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        strokeWidth: 2,
                        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
                      }),
                    }),
                    _ &&
                      (0, r.jsxs)(r.Fragment, {
                        children: [
                          (0, r.jsx)('span', {
                            className: 'font-medium',
                            children: E,
                          }),
                          (0, r.jsx)('span', {
                            className:
                              'text-xs text-red-500 max-w-full break-words',
                            children: t,
                          }),
                          !1,
                        ],
                      }),
                  ],
                }),
              })
            );
          const Q = () => {
            if (m)
              return (0, r.jsx)('div', {
                className: 'relative overflow-hidden',
                children: (0, r.jsx)(a.default, { ...K, fill: !0 }),
              });
            if (!i || !o)
              throw Error('Width and height are required when fill is false');
            return (0, r.jsx)(a.default, { ...K, width: i, height: o });
          };
          return v
            ? (0, r.jsxs)(r.Fragment, {
                children: [
                  U &&
                    (0, r.jsx)('script', {
                      type: 'application/ld+json',
                      dangerouslySetInnerHTML: { __html: JSON.stringify(U) },
                    }),
                  (0, r.jsxs)('figure', {
                    className: ''.concat(w),
                    itemScope: !0,
                    itemType: 'https://schema.org/ImageObject',
                    children: [
                      Q(),
                      (0, r.jsx)('figcaption', {
                        className: 'text-sm text-gray-600 mt-2 italic',
                        itemProp: 'caption',
                        children: v,
                      }),
                      (0, r.jsx)('meta', { itemProp: 'url', content: s }),
                      (0, r.jsx)('meta', {
                        itemProp: 'description',
                        content: t,
                      }),
                      i &&
                        (0, r.jsx)('meta', {
                          itemProp: 'width',
                          content: i.toString(),
                        }),
                      o &&
                        (0, r.jsx)('meta', {
                          itemProp: 'height',
                          content: o.toString(),
                        }),
                    ],
                  }),
                ],
              })
            : (0, r.jsxs)(r.Fragment, {
                children: [
                  U &&
                    (0, r.jsx)('script', {
                      type: 'application/ld+json',
                      dangerouslySetInnerHTML: { __html: JSON.stringify(U) },
                    }),
                  Q(),
                ],
              });
        };
    },
    3011: (e, s, t) => {
      'use strict';
      (Object.defineProperty(s, '__esModule', { value: !0 }),
        Object.defineProperty(s, 'useMergedRef', {
          enumerable: !0,
          get: function () {
            return l;
          },
        }));
      const r = t(2115);
      function l(e, s) {
        const t = (0, r.useRef)(null),
          l = (0, r.useRef)(null);
        return (0, r.useCallback)(
          r => {
            if (null === r) {
              const e = t.current;
              e && ((t.current = null), e());
              const s = l.current;
              s && ((l.current = null), s());
            } else (e && (t.current = a(e, r)), s && (l.current = a(s, r)));
          },
          [e, s]
        );
      }
      function a(e, s) {
        if ('function' != typeof e)
          return (
            (e.current = s),
            () => {
              e.current = null;
            }
          );
        {
          const t = e(s);
          return 'function' == typeof t ? t : () => e(null);
        }
      }
      ('function' == typeof s.default ||
        ('object' == typeof s.default && null !== s.default)) &&
        void 0 === s.default.__esModule &&
        (Object.defineProperty(s.default, '__esModule', { value: !0 }),
        Object.assign(s.default, s),
        (e.exports = s.default));
    },
    6276: (e, s, t) => {
      Promise.resolve().then(t.bind(t, 7303));
    },
    7303: (e, s, t) => {
      'use strict';
      (t.r(s), t.d(s, { default: () => a }));
      var r = t(5155);
      t(2115);
      var l = t(2548);
      function a() {
        return (0, r.jsxs)('div', {
          className: 'container mx-auto px-4 py-8',
          children: [
            (0, r.jsx)('h1', {
              className: 'text-3xl font-bold mb-8',
              children: 'Image Error Handling Test Page',
            }),
            (0, r.jsxs)('div', {
              className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8',
              children: [
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '1. Working Image',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/hero/paid-ads-analytics-screenshot.webp',
                        alt: 'Working analytics screenshot',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '2. Broken Image (No Fallback)',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/non-existent-image.jpg',
                        alt: 'This image does not exist',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        maxRetries: 2,
                        retryDelay: 1e3,
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '3. Broken Image with Fallback',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/broken-image.jpg',
                        alt: 'Broken image with fallback',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        fallbackSrc:
                          '/images/hero/paid-ads-analytics-screenshot.webp',
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '4. Custom Error Message',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/another-broken-image.jpg',
                        alt: 'Custom error message test',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        errorMessage: "Oops! This image couldn't be loaded.",
                        maxRetries: 1,
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '5. Custom Loading Component',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/hero/paid-ads-analytics-screenshot.webp',
                        alt: 'Custom loading test',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        loadingComponent: (0, r.jsx)('div', {
                          className:
                            'w-full h-48 bg-blue-100 flex items-center justify-center',
                          children: (0, r.jsx)('div', {
                            className: 'text-blue-600',
                            children: '\uD83D\uDD04 Custom Loading...',
                          }),
                        }),
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '6. Custom Error Component',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/custom-error-test.jpg',
                        alt: 'Custom error component test',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        errorComponent: (0, r.jsx)('div', {
                          className:
                            'w-full h-48 bg-purple-100 border-2 border-purple-300 flex items-center justify-center',
                          children: (0, r.jsxs)('div', {
                            className: 'text-purple-600 text-center',
                            children: [
                              (0, r.jsx)('div', {
                                className: 'text-2xl mb-2',
                                children: '\uD83C\uDFA8',
                              }),
                              (0, r.jsx)('div', {
                                children: 'Custom Error Design',
                              }),
                            ],
                          }),
                        }),
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '7. No Loading Indicator',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/hero/paid-ads-analytics-screenshot.webp',
                        alt: 'No loading indicator test',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        showLoadingIndicator: !1,
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '8. No Error Message',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)(l.default, {
                        src: '/images/silent-error-test.jpg',
                        alt: 'Silent error test',
                        width: 300,
                        height: 200,
                        className: 'rounded',
                        showErrorMessage: !1,
                      }),
                    }),
                  ],
                }),
                (0, r.jsxs)('div', {
                  className: 'space-y-4',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-xl font-semibold',
                      children: '9. Fill Mode with Error',
                    }),
                    (0, r.jsx)('div', {
                      className: 'border rounded-lg p-4',
                      children: (0, r.jsx)('div', {
                        className: 'relative w-full h-48',
                        children: (0, r.jsx)(l.default, {
                          src: '/images/fill-mode-error.jpg',
                          alt: 'Fill mode error test',
                          fill: !0,
                          className: 'rounded',
                          objectFit: 'cover',
                        }),
                      }),
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsxs)('div', {
              className: 'mt-12 p-6 bg-gray-100 rounded-lg',
              children: [
                (0, r.jsx)('h2', {
                  className: 'text-xl font-semibold mb-4',
                  children: 'Test Instructions',
                }),
                (0, r.jsxs)('ul', {
                  className: 'space-y-2 text-sm',
                  children: [
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 1:' }),
                        ' Should load successfully and show the analytics screenshot',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 2:' }),
                        ' Should show loading, then retry indicators, then error message',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 3:' }),
                        ' Should fail initially, then load the fallback image',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 4:' }),
                        ' Should show custom error message',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 5:' }),
                        ' Should show custom loading component briefly',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 6:' }),
                        ' Should show custom error component',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 7:' }),
                        ' Should load without showing loading indicator',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 8:' }),
                        ' Should show error state but without text message',
                      ],
                    }),
                    (0, r.jsxs)('li', {
                      children: [
                        (0, r.jsx)('strong', { children: 'Test 9:' }),
                        ' Should show error in fill mode',
                      ],
                    }),
                  ],
                }),
                (0, r.jsx)('p', {
                  className: 'mt-4 text-sm text-gray-600',
                  children:
                    'Open browser developer tools to see detailed logging of the image loading process.',
                }),
              ],
            }),
          ],
        });
      }
    },
  },
  e => {
    (e.O(0, [851, 441, 255, 358], () => e((e.s = 6276))), (_N_E = e.O()));
  },
]);

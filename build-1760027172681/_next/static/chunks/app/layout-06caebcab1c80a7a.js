(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [177],
  {
    63: (e, t, a) => {
      'use strict';
      var i = a(7260);
      a.o(i, 'usePathname') &&
        a.d(t, {
          usePathname: function () {
            return i.usePathname;
          },
        });
    },
    740: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => s });
      var i = a(5155),
        n = a(7127),
        o = a.n(n),
        r = a(63);
      const c = 'http://localhost:3000';
      function s(e) {
        var t, a;
        let {
            title: n,
            description:
              s = 'Professional marketing services with mobile-first approach. Specializing in photography, analytics, and ad campaigns to grow your business.',
            keywords: l = [],
            image: m = '/images/hero-bg.jpg',
            article: g,
            noIndex: d = !1,
            canonicalUrl: p,
          } = e,
          h = (0, r.usePathname)(),
          u = n
            ? ''.concat(n, ' | Mobile-First Marketing')
            : 'Mobile-First Marketing Agency | Photography, Analytics & Ad Campaigns',
          y = m.startsWith('http') ? m : ''.concat(c).concat(m),
          v = p || ''.concat(c).concat(h),
          _ = [
            'mobile marketing',
            'photography services',
            'analytics',
            'ad campaigns',
            'digital marketing',
            'mobile-first design',
            ...l,
          ].join(', '),
          f = {
            '@context': 'https://schema.org',
            '@type': g ? 'Article' : 'WebPage',
            name: u,
            description: s,
            url: v,
            image: y,
            ...(g && {
              headline: n,
              datePublished: g.publishedTime,
              dateModified: g.modifiedTime || g.publishedTime,
              author: { '@type': 'Person', name: g.author || 'Marketing Team' },
              publisher: {
                '@type': 'Organization',
                name: 'Mobile-First Marketing',
                logo: {
                  '@type': 'ImageObject',
                  url: ''.concat(c, '/images/logo.png'),
                },
              },
              articleSection: g.section,
              keywords: null == (t = g.tags) ? void 0 : t.join(', '),
            }),
          };
        return (0, i.jsxs)(o(), {
          children: [
            (0, i.jsx)('title', { children: u }),
            (0, i.jsx)('meta', { name: 'description', content: s }),
            (0, i.jsx)('meta', { name: 'keywords', content: _ }),
            (0, i.jsx)('link', { rel: 'canonical', href: v }),
            d &&
              (0, i.jsx)('meta', {
                name: 'robots',
                content: 'noindex,nofollow',
              }),
            (0, i.jsx)('meta', {
              property: 'og:type',
              content: g ? 'article' : 'website',
            }),
            (0, i.jsx)('meta', { property: 'og:title', content: u }),
            (0, i.jsx)('meta', { property: 'og:description', content: s }),
            (0, i.jsx)('meta', { property: 'og:image', content: y }),
            (0, i.jsx)('meta', { property: 'og:url', content: v }),
            (0, i.jsx)('meta', {
              property: 'og:site_name',
              content: 'Mobile-First Marketing',
            }),
            (0, i.jsx)('meta', { property: 'og:locale', content: 'en_US' }),
            g &&
              (0, i.jsxs)(i.Fragment, {
                children: [
                  g.publishedTime &&
                    (0, i.jsx)('meta', {
                      property: 'article:published_time',
                      content: g.publishedTime,
                    }),
                  g.modifiedTime &&
                    (0, i.jsx)('meta', {
                      property: 'article:modified_time',
                      content: g.modifiedTime,
                    }),
                  g.author &&
                    (0, i.jsx)('meta', {
                      property: 'article:author',
                      content: g.author,
                    }),
                  g.section &&
                    (0, i.jsx)('meta', {
                      property: 'article:section',
                      content: g.section,
                    }),
                  null == (a = g.tags)
                    ? void 0
                    : a.map((e, t) =>
                        (0, i.jsx)(
                          'meta',
                          { property: 'article:tag', content: e },
                          t
                        )
                      ),
                ],
              }),
            (0, i.jsx)('meta', {
              name: 'twitter:card',
              content: 'summary_large_image',
            }),
            (0, i.jsx)('meta', { name: 'twitter:title', content: u }),
            (0, i.jsx)('meta', { name: 'twitter:description', content: s }),
            (0, i.jsx)('meta', { name: 'twitter:image', content: y }),
            (0, i.jsx)('meta', {
              name: 'viewport',
              content: 'width=device-width, initial-scale=1, maximum-scale=5',
            }),
            (0, i.jsx)('meta', { name: 'theme-color', content: '#000000' }),
            (0, i.jsx)('meta', {
              name: 'format-detection',
              content: 'telephone=no',
            }),
            (0, i.jsx)('script', {
              type: 'application/ld+json',
              dangerouslySetInnerHTML: { __html: JSON.stringify(f) },
            }),
          ],
        });
      }
    },
    1088: e => {
      e.exports = {
        style: { fontFamily: "'Inter', 'Inter Fallback'", fontStyle: 'normal' },
        className: '__className_fa2f99',
        variable: '__variable_fa2f99',
      };
    },
    2514: (e, t, a) => {
      'use strict';
      (a.d(t, { Ay: () => o }), a(5155), a(2115));
      var i = a(5904);
      class n {
        static initialize() {
          if (this.isInitialized) return;
          const e = i.C.analytics.googleAnalyticsId;
          if (!e) return void this.debugMode;
          try {
            const t = document.createElement('script');
            ((t.async = !0),
              (t.src = 'https://www.googletagmanager.com/gtag/js?id='.concat(
                e
              )),
              document.head.appendChild(t),
              (window.dataLayer = window.dataLayer || []),
              (window.gtag = function () {
                window.dataLayer.push(arguments);
              }),
              window.gtag('js', new Date()),
              window.gtag('config', e, {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: !0,
                allow_enhanced_conversions: !0,
                allow_google_signals: !0,
                anonymize_ip: !0,
                respect_dnt: !0,
              }),
              (this.isInitialized = !0),
              this.debugMode);
          } catch (e) {}
        }
        static trackPageView(e, t) {
          if (this.isGoogleAnalyticsAvailable())
            try {
              (window.gtag('config', i.C.analytics.googleAnalyticsId, {
                page_title: t || document.title,
                page_location: e,
                send_page_view: !0,
              }),
                this.debugMode);
            } catch (e) {}
        }
        static trackEvent(e) {
          if (!this.isGoogleAnalyticsAvailable()) return void this.debugMode;
          try {
            (window.gtag('event', e.action, {
              event_category: e.category,
              event_label: e.label,
              value: e.value,
              ...e.custom_parameters,
            }),
              this.debugMode);
          } catch (e) {}
        }
        static trackConversion(e) {
          if (!this.isGoogleAnalyticsAvailable()) return void this.debugMode;
          try {
            (window.gtag('event', e.event_name, {
              currency: e.currency || 'USD',
              value: e.value || 0,
              transaction_id: e.transaction_id,
              items: e.items,
            }),
              this.debugMode);
          } catch (e) {}
        }
        static trackFormSubmission(e, t) {
          (this.trackEvent({
            action: 'form_submit',
            category: 'engagement',
            label: e,
            custom_parameters: {
              form_type: e,
              form_location: window.location.pathname,
              ...t,
            },
          }),
            this.trackConversion({
              event_name: 'generate_lead',
              value: this.getFormValue(e),
              items: [
                {
                  item_id: 'form_'.concat(e),
                  item_name: ''.concat(e, ' Form Submission'),
                  category: 'lead_generation',
                  quantity: 1,
                  price: this.getFormValue(e),
                },
              ],
            }));
        }
        static trackButtonClick(e, t) {
          const a =
            arguments.length > 2 && void 0 !== arguments[2]
              ? arguments[2]
              : 'engagement';
          this.trackEvent({
            action: 'click',
            category: a,
            label: e,
            custom_parameters: {
              button_text: e,
              click_location: t,
              page_location: window.location.pathname,
            },
          });
        }
        static trackPhoneCall(e) {
          (this.trackEvent({
            action: 'phone_call',
            category: 'engagement',
            label: e,
            custom_parameters: {
              phone_number: e,
              call_location: window.location.pathname,
            },
          }),
            this.trackConversion({
              event_name: 'phone_call',
              value: 50,
              items: [
                {
                  item_id: 'phone_call',
                  item_name: 'Phone Call',
                  category: 'lead_generation',
                  quantity: 1,
                  price: 50,
                },
              ],
            }));
        }
        static trackEmailClick(e) {
          (this.trackEvent({
            action: 'email_click',
            category: 'engagement',
            label: e,
            custom_parameters: {
              email_address: e,
              email_location: window.location.pathname,
            },
          }),
            this.trackConversion({
              event_name: 'email_click',
              value: 25,
              items: [
                {
                  item_id: 'email_click',
                  item_name: 'Email Click',
                  category: 'lead_generation',
                  quantity: 1,
                  price: 25,
                },
              ],
            }));
        }
        static trackServiceInterest(e, t) {
          this.trackEvent({
            action: t,
            category: 'service_interest',
            label: e,
            custom_parameters: {
              service_name: e,
              interest_type: t,
              page_location: window.location.pathname,
            },
          });
        }
        static trackScrollDepth(e) {
          [25, 50, 75, 90, 100].includes(e) &&
            this.trackEvent({
              action: 'scroll',
              category: 'engagement',
              label: ''.concat(e, '%'),
              value: e,
              custom_parameters: {
                scroll_depth: e,
                page_location: window.location.pathname,
              },
            });
        }
        static trackTimeOnPage(e) {
          [30, 60, 120, 300].includes(e) &&
            this.trackEvent({
              action: 'time_on_page',
              category: 'engagement',
              label: ''.concat(e, 's'),
              value: e,
              custom_parameters: {
                time_seconds: e,
                page_location: window.location.pathname,
              },
            });
        }
        static trackWebVitals(e) {
          this.trackEvent({
            action: 'web_vitals',
            category: 'performance',
            label: e.name,
            value: Math.round(e.value),
            custom_parameters: {
              metric_name: e.name,
              metric_value: e.value,
              metric_rating: e.rating,
              page_location: window.location.pathname,
            },
          });
        }
        static trackEngagementScore(e, t) {
          this.trackEvent({
            action: 'engagement_score',
            category: 'user_behavior',
            label: 'Score: '.concat(e),
            value: e,
            custom_parameters: {
              engagement_score: e,
              engagement_factors: t.join(','),
              page_location: window.location.pathname,
            },
          });
        }
        static isGoogleAnalyticsAvailable() {
          return (
            'function' == typeof window.gtag &&
            !!i.C.analytics.googleAnalyticsId
          );
        }
        static getFormValue(e) {
          return (
            {
              general_contact: 75,
              service_inquiry: 150,
              photography: 200,
              analytics: 300,
              ad_campaigns: 500,
            }[e] || 100
          );
        }
      }
      ((n.isInitialized = !1), (n.debugMode = !1));
      const o = n;
    },
    2865: (e, t, a) => {
      (Promise.resolve().then(a.t.bind(a, 1088, 23)),
        Promise.resolve().then(a.t.bind(a, 3673, 23)),
        Promise.resolve().then(a.bind(a, 5821)),
        Promise.resolve().then(a.bind(a, 3035)),
        Promise.resolve().then(a.bind(a, 740)),
        Promise.resolve().then(a.bind(a, 5370)),
        Promise.resolve().then(a.t.bind(a, 4727, 23)));
    },
    3035: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => o });
      var i = a(5155),
        n = a(63);
      function o(e) {
        let { canonicalUrl: t, supportedLocales: a = ['en'] } = e,
          o = (0, n.usePathname)(),
          r =
            t ||
            (function (e) {
              let {
                  path: t,
                  removeTrailingSlash: a = !0,
                  removeQueryParams: i = !0,
                } = e,
                n = t;
              return (
                i && n.includes('?') && (n = n.split('?')[0]),
                a && '/' !== n && n.endsWith('/') && (n = n.slice(0, -1)),
                n.startsWith('/') || (n = '/'.concat(n)),
                ''.concat('http://localhost:3000').concat(n)
              );
            })({ path: o }),
          c = (function (e) {
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
          })(o, a);
        return (0, i.jsxs)(i.Fragment, {
          children: [
            (0, i.jsx)('link', { rel: 'canonical', href: r }),
            c.map(e =>
              (0, i.jsx)(
                'link',
                { rel: 'alternate', hrefLang: e.hreflang, href: e.href },
                e.hreflang
              )
            ),
            (0, i.jsx)('link', {
              rel: 'alternate',
              hrefLang: 'x-default',
              href: r,
            }),
          ],
        });
      }
    },
    3673: () => {},
    4727: () => {},
    5370: (e, t, a) => {
      'use strict';
      a.d(t, { default: () => r });
      var i = a(5155),
        n = a(63);
      const o = 'http://localhost:3000';
      function r(e) {
        let t,
          { type: a = 'organization', data: r } = e;
        switch (((0, n.usePathname)(), a)) {
          case 'organization':
          default:
            t = {
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Mobile-First Vivid Auto Photography',
              description:
                'Professional Vivid Auto Photography services with mobile-first approach specializing in photography, analytics, and ad campaigns.',
              url: o,
              logo: ''.concat(o, '/images/logo.png'),
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
              url: o,
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
                    o,
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
              name: r.name || 'Marketing Service',
              description: r.description || 'Professional marketing service',
              provider: {
                '@type': 'Organization',
                name: 'Mobile-First Marketing',
                url: o,
              },
              areaServed: 'United States',
              serviceType: r.serviceType || 'Marketing',
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
              itemListElement: r.map((e, t) => ({
                '@type': 'ListItem',
                position: t + 1,
                name: e.name,
                item: e.url,
              })),
            };
        }
        return (0, i.jsx)('script', {
          type: 'application/ld+json',
          dangerouslySetInnerHTML: { __html: JSON.stringify(t) },
        });
      }
    },
    5821: (e, t, a) => {
      'use strict';
      a.d(t, { AnalyticsProvider: () => c });
      var i = a(5155),
        n = a(2115),
        o = a(63),
        r = a(2514);
      function c(e) {
        let { children: t } = e,
          a = (0, o.usePathname)();
        return (
          (0, n.useEffect)(() => {
            (r.Ay.initialize(),
              r.Ay.trackPageView(window.location.href, document.title));
            {
              let e = 0,
                t = () => {
                  const t = Math.round(
                    ((window.pageYOffset ||
                      document.documentElement.scrollTop) /
                      (document.documentElement.scrollHeight -
                        window.innerHeight)) *
                      100
                  );
                  t > e && ((e = t), r.Ay.trackScrollDepth(t));
                },
                a = Date.now(),
                i = [30, 60, 120, 300],
                n = new Set();
              window.addEventListener('scroll', t, { passive: !0 });
              const o = setInterval(() => {
                const e = Math.floor((Date.now() - a) / 1e3);
                i.forEach(t => {
                  e >= t && !n.has(t) && (n.add(t), r.Ay.trackTimeOnPage(t));
                });
              }, 5e3);
              return () => {
                (window.removeEventListener('scroll', t), clearInterval(o));
              };
            }
          }, []),
          (0, n.useEffect)(() => {
            a && r.Ay.trackPageView(window.location.href, document.title);
          }, [a]),
          (0, i.jsx)(i.Fragment, { children: t })
        );
      }
    },
    5904: (e, t, a) => {
      'use strict';
      a.d(t, { C: () => i });
      const i = {
        title: 'Mobile-First Vivid Auto Photography Website',
        description:
          'Professional Vivid Auto Photography services including Photography, Analytics, and Ad Campaigns with mobile-first design.',
        url: 'http://localhost:3000',
        logo: '/images/logo.svg',
        favicon: '/favicon.ico',
        socialMedia: {
          facebook: 'https://facebook.com/yourcompany',
          twitter: 'https://twitter.com/yourcompany',
          linkedin: 'https://linkedin.com/company/yourcompany',
          instagram: 'https://instagram.com/yourcompany',
        },
        contact: {
          email: a(5704).env.CONTACT_EMAIL || 'contact@your-domain.com',
          phone: '+1 (555) 123-4567',
          address: '123 Business St, City, State 12345',
        },
        analytics: { googleAnalyticsId: 'G-XXXXXXXXXX', facebookPixelId: '' },
      };
    },
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
    (e.O(0, [702, 189, 963, 481, 441, 255, 358], () => e((e.s = 2865))),
      (_N_E = e.O()));
  },
]);

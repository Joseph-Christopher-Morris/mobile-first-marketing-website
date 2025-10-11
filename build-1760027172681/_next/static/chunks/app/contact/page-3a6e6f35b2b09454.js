(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [977],
  {
    63: (e, t, a) => {
      'use strict';
      var r = a(7260);
      a.o(r, 'usePathname') &&
        a.d(t, {
          usePathname: function () {
            return r.usePathname;
          },
        });
    },
    1265: (e, t, a) => {
      'use strict';
      a.d(t, { MobileMenu: () => i });
      var r = a(5155),
        o = a(2115),
        n = a(2619),
        s = a.n(n);
      function i(e) {
        const { isOpen: t, onClose: a, navigationItems: n, currentPath: i } = e;
        return ((0, o.useEffect)(() => {
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
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)('div', {
                  className:
                    'fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden',
                  onClick: a,
                  'aria-hidden': 'true',
                }),
                (0, r.jsxs)('div', {
                  className:
                    'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden '.concat(
                      t ? 'translate-x-0' : 'translate-x-full'
                    ),
                  role: 'dialog',
                  'aria-modal': 'true',
                  'aria-label': 'Mobile navigation menu',
                  children: [
                    (0, r.jsxs)('div', {
                      className:
                        'flex items-center justify-between p-4 border-b border-gray-200',
                      children: [
                        (0, r.jsx)('h2', {
                          className: 'text-lg font-semibold text-gray-900',
                          children: 'Menu',
                        }),
                        (0, r.jsx)('button', {
                          onClick: a,
                          className:
                            'p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                          'aria-label': 'Close menu',
                          children: (0, r.jsx)('svg', {
                            className: 'w-6 h-6',
                            fill: 'none',
                            stroke: 'currentColor',
                            viewBox: '0 0 24 24',
                            'aria-hidden': 'true',
                            children: (0, r.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            }),
                          }),
                        }),
                      ],
                    }),
                    (0, r.jsx)('nav', {
                      className: 'flex flex-col p-4 space-y-2',
                      role: 'navigation',
                      children: n.map(e =>
                        (0, r.jsx)(
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
                    (0, r.jsx)('div', {
                      className:
                        'absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50',
                      children: (0, r.jsx)(s(), {
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
    2514: (e, t, a) => {
      'use strict';
      (a.d(t, { Ay: () => n }), a(5155), a(2115));
      var r = a(5904);
      class o {
        static initialize() {
          if (this.isInitialized) return;
          const e = r.C.analytics.googleAnalyticsId;
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
              (window.gtag('config', r.C.analytics.googleAnalyticsId, {
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
            !!r.C.analytics.googleAnalyticsId
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
      ((o.isInitialized = !1), (o.debugMode = !1));
      const n = o;
    },
    2830: (e, t, a) => {
      'use strict';
      a.d(t, { GeneralContactForm: () => n });
      var r = a(5155),
        o = a(2115);
      function n() {
        const [e, t] = (0, o.useState)({
          name: '',
          email: '',
          phone: '',
          company: '',
          subject: '',
          service: '',
          message: '',
        });
        o.useEffect(() => {
          'true' ===
            new URLSearchParams(window.location.search).get('success') &&
            (c({
              success: !0,
              message:
                "Thank you for your message! We'll get back to you within 24 hours.",
              submissionId: 'success_' + Date.now(),
            }),
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            ));
        }, []);
        const [a, n] = (0, o.useState)({}),
          [s, i] = (0, o.useState)(!1),
          [l, c] = (0, o.useState)(null),
          d = e => {
            const { name: r, value: o } = e.target;
            (t(e => ({ ...e, [r]: o })),
              a[r] && n(e => ({ ...e, [r]: '' })),
              l && c(null));
          };
        return (null == l ? void 0 : l.success)
          ? (0, r.jsxs)('div', {
              className:
                'bg-green-50 border border-green-200 rounded-lg p-8 text-center',
              children: [
                (0, r.jsx)('div', {
                  className:
                    'w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4',
                  children: (0, r.jsx)('svg', {
                    className: 'w-8 h-8 text-green-600',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                    children: (0, r.jsx)('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M5 13l4 4L19 7',
                    }),
                  }),
                }),
                (0, r.jsx)('h3', {
                  className: 'text-xl font-bold text-green-900 mb-2',
                  children: 'Thank You!',
                }),
                (0, r.jsx)('p', {
                  className: 'text-green-700 mb-4',
                  children: l.message,
                }),
                l.submissionId &&
                  (0, r.jsxs)('p', {
                    className: 'text-sm text-green-600 mb-4',
                    children: ['Reference ID: ', l.submissionId],
                  }),
                (0, r.jsx)('button', {
                  onClick: () => {
                    (c(null),
                      t({
                        name: '',
                        email: '',
                        phone: '',
                        company: '',
                        subject: '',
                        service: '',
                        message: '',
                      }));
                  },
                  className:
                    'text-green-600 hover:text-green-700 font-medium transition-colors',
                  children: 'Send Another Message',
                }),
              ],
            })
          : (0, r.jsxs)('div', {
              className: 'bg-white border border-gray-200 rounded-lg p-8',
              children: [
                (0, r.jsxs)('div', {
                  className: 'mb-6',
                  children: [
                    (0, r.jsx)('h2', {
                      className: 'text-2xl font-bold text-gray-900 mb-2',
                      children: 'Send us a Message',
                    }),
                    (0, r.jsx)('p', {
                      className: 'text-gray-600',
                      children:
                        "We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
                    }),
                  ],
                }),
                (0, r.jsxs)('form', {
                  onSubmit: t => {
                    if (!e.name || !e.email || !e.subject || !e.message) {
                      (t.preventDefault(),
                        c({
                          success: !1,
                          message:
                            'Please fill in all required fields (Name, Email, Subject, Message).',
                        }));
                      return;
                    }
                  },
                  action: 'https://formspree.io/f/xovkngyr',
                  method: 'POST',
                  className: 'space-y-6',
                  children: [
                    (0, r.jsx)('input', {
                      type: 'hidden',
                      name: '_subject',
                      value: 'New Contact Form Submission from Website',
                    }),
                    (0, r.jsx)('input', {
                      type: 'hidden',
                      name: '_next',
                      value:
                        'https://d15sc9fc739ev2.cloudfront.net/contact?success=true',
                    }),
                    (0, r.jsx)('input', {
                      type: 'hidden',
                      name: '_captcha',
                      value: 'false',
                    }),
                    (0, r.jsx)('input', {
                      type: 'hidden',
                      name: '_template',
                      value: 'table',
                    }),
                    (0, r.jsxs)('div', {
                      className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                      children: [
                        (0, r.jsxs)('div', {
                          children: [
                            (0, r.jsx)('label', {
                              htmlFor: 'name',
                              className:
                                'block text-sm font-medium text-gray-700 mb-2',
                              children: 'Full Name *',
                            }),
                            (0, r.jsx)('input', {
                              type: 'text',
                              id: 'name',
                              name: 'name',
                              value: e.name,
                              onChange: d,
                              className:
                                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 '.concat(
                                  a.name ? 'border-red-300' : 'border-gray-300'
                                ),
                              placeholder: 'Enter your full name',
                              required: !0,
                            }),
                            a.name &&
                              (0, r.jsx)('p', {
                                className: 'mt-1 text-sm text-red-600',
                                children: a.name,
                              }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          children: [
                            (0, r.jsx)('label', {
                              htmlFor: 'email',
                              className:
                                'block text-sm font-medium text-gray-700 mb-2',
                              children: 'Email Address *',
                            }),
                            (0, r.jsx)('input', {
                              type: 'email',
                              id: 'email',
                              name: 'email',
                              value: e.email,
                              onChange: d,
                              className:
                                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 '.concat(
                                  a.email ? 'border-red-300' : 'border-gray-300'
                                ),
                              placeholder: 'Enter your email address',
                              required: !0,
                            }),
                            a.email &&
                              (0, r.jsx)('p', {
                                className: 'mt-1 text-sm text-red-600',
                                children: a.email,
                              }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                      children: [
                        (0, r.jsxs)('div', {
                          children: [
                            (0, r.jsx)('label', {
                              htmlFor: 'phone',
                              className:
                                'block text-sm font-medium text-gray-700 mb-2',
                              children: 'Phone Number (Optional)',
                            }),
                            (0, r.jsx)('input', {
                              type: 'tel',
                              id: 'phone',
                              name: 'phone',
                              value: e.phone,
                              onChange: d,
                              className:
                                'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500',
                              placeholder: 'Enter your phone number',
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          children: [
                            (0, r.jsx)('label', {
                              htmlFor: 'company',
                              className:
                                'block text-sm font-medium text-gray-700 mb-2',
                              children: 'Company (Optional)',
                            }),
                            (0, r.jsx)('input', {
                              type: 'text',
                              id: 'company',
                              name: 'company',
                              value: e.company,
                              onChange: d,
                              className:
                                'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500',
                              placeholder: 'Enter your company name',
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                      children: [
                        (0, r.jsxs)('div', {
                          children: [
                            (0, r.jsx)('label', {
                              htmlFor: 'service',
                              className:
                                'block text-sm font-medium text-gray-700 mb-2',
                              children: 'Service Interest (Optional)',
                            }),
                            (0, r.jsxs)('select', {
                              id: 'service',
                              name: 'service',
                              value: e.service,
                              onChange: d,
                              className:
                                'w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900',
                              children: [
                                (0, r.jsx)('option', {
                                  value: '',
                                  children: 'Select a service',
                                }),
                                [
                                  'Photography Services',
                                  'Data Analytics & Insights',
                                  'Strategic Ad Campaigns',
                                  'General Inquiry',
                                  'Other',
                                ].map(e =>
                                  (0, r.jsx)(
                                    'option',
                                    { value: e, children: e },
                                    e
                                  )
                                ),
                              ],
                            }),
                          ],
                        }),
                        (0, r.jsxs)('div', {
                          children: [
                            (0, r.jsx)('label', {
                              htmlFor: 'subject',
                              className:
                                'block text-sm font-medium text-gray-700 mb-2',
                              children: 'Subject *',
                            }),
                            (0, r.jsx)('input', {
                              type: 'text',
                              id: 'subject',
                              name: 'subject',
                              value: e.subject,
                              onChange: d,
                              className:
                                'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-500 '.concat(
                                  a.subject
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                                ),
                              placeholder: 'Enter message subject',
                              required: !0,
                            }),
                            a.subject &&
                              (0, r.jsx)('p', {
                                className: 'mt-1 text-sm text-red-600',
                                children: a.subject,
                              }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      children: [
                        (0, r.jsx)('label', {
                          htmlFor: 'message',
                          className:
                            'block text-sm font-medium text-gray-700 mb-2',
                          children: 'Message *',
                        }),
                        (0, r.jsx)('textarea', {
                          id: 'message',
                          name: 'message',
                          rows: 6,
                          value: e.message,
                          onChange: d,
                          className:
                            'w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical text-gray-900 placeholder-gray-500 '.concat(
                              a.message ? 'border-red-300' : 'border-gray-300'
                            ),
                          placeholder: 'Tell us how we can help you...',
                          required: !0,
                        }),
                        a.message &&
                          (0, r.jsx)('p', {
                            className: 'mt-1 text-sm text-red-600',
                            children: a.message,
                          }),
                      ],
                    }),
                    (0, r.jsxs)('div', {
                      children: [
                        l &&
                          !l.success &&
                          (0, r.jsx)('div', {
                            className:
                              'mb-4 p-4 bg-red-50 border border-red-200 rounded-lg',
                            children: (0, r.jsxs)('div', {
                              className: 'flex items-start space-x-3',
                              children: [
                                (0, r.jsx)('div', {
                                  className: 'flex-shrink-0',
                                  children: (0, r.jsx)('svg', {
                                    className: 'w-5 h-5 text-red-600 mt-0.5',
                                    fill: 'none',
                                    stroke: 'currentColor',
                                    viewBox: '0 0 24 24',
                                    children: (0, r.jsx)('path', {
                                      strokeLinecap: 'round',
                                      strokeLinejoin: 'round',
                                      strokeWidth: 2,
                                      d: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                    }),
                                  }),
                                }),
                                (0, r.jsxs)('div', {
                                  children: [
                                    (0, r.jsx)('h4', {
                                      className:
                                        'text-sm font-medium text-red-800',
                                      children: 'Submission Failed',
                                    }),
                                    (0, r.jsx)('p', {
                                      className: 'text-sm text-red-700 mt-1',
                                      children: l.message,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        (0, r.jsx)('button', {
                          type: 'submit',
                          disabled: s,
                          className:
                            'w-full px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-h-[56px] '.concat(
                              s
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-blue-700'
                            ),
                          children: s
                            ? (0, r.jsxs)('span', {
                                className: 'flex items-center justify-center',
                                children: [
                                  (0, r.jsxs)('svg', {
                                    className:
                                      'animate-spin -ml-1 mr-3 h-5 w-5 text-white',
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    fill: 'none',
                                    viewBox: '0 0 24 24',
                                    children: [
                                      (0, r.jsx)('circle', {
                                        className: 'opacity-25',
                                        cx: '12',
                                        cy: '12',
                                        r: '10',
                                        stroke: 'currentColor',
                                        strokeWidth: '4',
                                      }),
                                      (0, r.jsx)('path', {
                                        className: 'opacity-75',
                                        fill: 'currentColor',
                                        d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                                      }),
                                    ],
                                  }),
                                  'Sending Message...',
                                ],
                              })
                            : 'Send Message',
                        }),
                      ],
                    }),
                    (0, r.jsx)('div', {
                      className: 'text-center text-sm text-gray-500',
                      children: (0, r.jsxs)('p', {
                        children: [
                          'By submitting this form, you agree to our',
                          ' ',
                          (0, r.jsx)('a', {
                            href: '/privacy',
                            className: 'text-blue-600 hover:text-blue-700',
                            children: 'Privacy Policy',
                          }),
                          ' ',
                          'and',
                          ' ',
                          (0, r.jsx)('a', {
                            href: '/terms',
                            className: 'text-blue-600 hover:text-blue-700',
                            children: 'Terms of Service',
                          }),
                          '.',
                        ],
                      }),
                    }),
                  ],
                }),
              ],
            });
      }
    },
    3904: (e, t, a) => {
      'use strict';
      a.d(t, { ContactLink: () => s, ContactPageClient: () => n });
      var r = a(5155);
      a(5904);
      var o = a(2514);
      function n(e) {
        const { children: t } = e;
        return (0, r.jsx)('div', { children: t });
      }
      function s(e) {
        let { type: t, value: a, children: n, className: s = '' } = e,
          i =
            'phone' === t
              ? 'tel:'.concat(a.replace(/\D/g, ''))
              : 'mailto:'.concat(a);
        return (0, r.jsx)('a', {
          href: i,
          onClick: () => {
            'phone' === t
              ? o.Ay.trackPhoneCall(a)
              : 'email' === t && o.Ay.trackEmailClick(a);
          },
          className: s,
          children: n,
        });
      }
    },
    5481: (e, t, a) => {
      'use strict';
      (a.r(t), a.d(t, { BottomNavigation: () => l }));
      var r = a(5155);
      a(2115);
      var o = a(2619),
        n = a.n(o),
        s = a(63);
      const i = [
        {
          label: 'Home',
          href: '/',
          icon: (0, r.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, r.jsx)('path', {
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
          icon: (0, r.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, r.jsx)('path', {
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
          icon: (0, r.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, r.jsx)('path', {
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
          icon: (0, r.jsx)('svg', {
            className: 'w-6 h-6',
            fill: 'none',
            stroke: 'currentColor',
            viewBox: '0 0 24 24',
            'aria-hidden': 'true',
            children: (0, r.jsx)('path', {
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
        return (0, r.jsx)('nav', {
          className:
            'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40',
          role: 'navigation',
          'aria-label': 'Bottom navigation',
          children: (0, r.jsx)('div', {
            className: 'flex items-center justify-around px-2 py-1',
            children: i.map(t => {
              const a = e === t.href;
              return (0, r.jsxs)(
                n(),
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
                    (0, r.jsx)('div', {
                      className: 'transition-transform '.concat(
                        a ? 'scale-110' : ''
                      ),
                      children: t.icon,
                    }),
                    (0, r.jsx)('span', {
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
      var r = a(5155),
        o = a(2115),
        n = a(2619),
        s = a.n(n),
        i = a(63),
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
          [a, n] = (0, o.useState)(!1),
          d = (0, i.usePathname)();
        return (0, r.jsxs)(r.Fragment, {
          children: [
            (0, r.jsx)('header', {
              className:
                'sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm',
              children: (0, r.jsx)('div', {
                className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
                children: (0, r.jsxs)('div', {
                  className: 'flex justify-between items-center h-16 md:h-20',
                  children: [
                    (0, r.jsx)(s(), {
                      href: '/',
                      className:
                        'flex items-center text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors',
                      'aria-label': 'Go to homepage',
                      children: (0, r.jsx)('img', {
                        src: '/images/icons/Vivid Auto Photography Logo.png',
                        alt: 'Vivid Auto Photography Logo',
                        className: 'w-48 h-48 object-contain',
                        width: 192,
                        height: 192,
                      }),
                    }),
                    (0, r.jsx)('nav', {
                      className:
                        'hidden md:flex items-center space-x-6 lg:space-x-8',
                      role: 'navigation',
                      children: c.map(e =>
                        (0, r.jsx)(
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
                    (0, r.jsx)('div', {
                      className: 'hidden md:flex items-center space-x-4',
                      children: (0, r.jsx)(s(), {
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
                    (0, r.jsx)('button', {
                      onClick: () => {
                        n(!a);
                      },
                      className:
                        'md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 min-w-[44px] min-h-[44px] flex items-center justify-center',
                      'aria-label': 'Toggle mobile menu',
                      'aria-expanded': a,
                      children: (0, r.jsx)('svg', {
                        className: 'w-6 h-6',
                        fill: 'none',
                        stroke: 'currentColor',
                        viewBox: '0 0 24 24',
                        'aria-hidden': 'true',
                        children: a
                          ? (0, r.jsx)('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              strokeWidth: 2,
                              d: 'M6 18L18 6M6 6l12 12',
                            })
                          : (0, r.jsx)('path', {
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
            (0, r.jsx)(l.MobileMenu, {
              isOpen: a,
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
    5904: (e, t, a) => {
      'use strict';
      a.d(t, { C: () => r });
      const r = {
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
    6287: (e, t, a) => {
      (Promise.resolve().then(a.t.bind(a, 2619, 23)),
        Promise.resolve().then(a.bind(a, 5481)),
        Promise.resolve().then(a.bind(a, 5545)),
        Promise.resolve().then(a.bind(a, 1265)),
        Promise.resolve().then(a.bind(a, 3904)),
        Promise.resolve().then(a.bind(a, 2830)));
    },
  },
  e => {
    (e.O(0, [619, 441, 255, 358], () => e((e.s = 6287))), (_N_E = e.O()));
  },
]);

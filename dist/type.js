import { useEffect as e, useLayoutEffect as t, useMemo as n, useReducer as r, useRef as i, useState as a } from "react";
import { jsx as o, jsxs as s } from "react/jsx-runtime";
//#region src/text.ts
var c = /* @__PURE__ */ "the.be.of.and.to.in.have.it.that.for.they.with.as.not.on.she.at.by.this.we.you.do.but.from.or.which.one.would.all.will.there.say.who.make.when.can.more.if.no.out.other.so.what.time.up.go.about.than.into.could.state.only.new.year.some.take.come.these.know.see.use.get.like.then.first.any.work.now.may.such.give.over.think.most.even.find.day.also.after.way.many.must.look.before.great.back.through.long.where.much.should.well.people.down.own.just.because.good.each.those.feel.seem.how.high.too.place.little.world.very.still.hand.old.life.tell.write.become.here.show.house.both.between.need.mean.call.under.last.right.move.thing.school.never.same.another.begin.while.number.part.turn.real.leave.might.want.point.form.off.child.few.small.since.against.ask.late.home.large.person.end.open.public.follow.during.present.without.again.hold.around.head.word.problem.however.lead.system.set.order.eye.plan.run.keep.face.fact.group.play.stand.early.course.change.help.line.light.field.water.read.hard.near.night.walk.white.start.hear.close.book.story.sound.learn.slow.quiet.clear.build.reach.carry.watch".split("."), l = [
	{
		title: "On a quiet keyboard",
		body: "A good keyboard is a quiet one. You stop noticing the keys and start noticing the words, and the gap between the thought and the line on the screen gets thin enough to forget about. That is the whole trick, and it takes nothing but repetition: the same letters, over and over, until your hands stop asking where they are."
	},
	{
		title: "The early hour",
		body: "The best hour of the morning is the one nobody else knows about. The street is still empty, the light is thin and blue, and the only sound is a kettle somewhere in the building. Work started then has a way of going well, as if the day has not yet made up its mind to be difficult."
	},
	{
		title: "What a program is",
		body: "Every program is a small argument about how the world is shaped. You name the parts, you say how they move, and then you find out what you got wrong. The finding out is the job. The typing is only how the argument gets written down, one careful line after another."
	},
	{
		title: "Patience, at the shore",
		body: "The sea does the same thing all day and never looks bored. It comes up the sand, holds for a moment, and slides back out, and by evening the whole beach has been rearranged. Patience is not sitting still. It is doing the small thing again, and then again, until the shape of it changes."
	},
	{
		title: "Speed is a side effect",
		body: "Nobody gets faster by trying to be fast. They get faster by making fewer mistakes, and the mistakes go away when the motion stops being a decision. Slow down until the errors stop, then let the pace come back on its own. It always does, and it arrives without being asked."
	}
], u = [
	15,
	30,
	60
], d = 8, f = 220;
function p(e, t = {}) {
	let n = t.passages?.length ? t.passages : l, r = t.words?.length ? t.words : c;
	if (e === "prose") {
		let e = n[Math.floor(Math.random() * n.length)];
		return {
			words: e.body.split(/\s+/).filter(Boolean),
			source: e.title
		};
	}
	let i = () => r[Math.floor(Math.random() * r.length)], a = [];
	for (let e = 0; e < f; e++) {
		let t = i();
		for (; r.length > 1 && t === a[e - 1];) t = i();
		a.push(t);
	}
	return {
		words: a,
		source: null
	};
}
function m(e) {
	return {
		words: e.words,
		source: e.source,
		typed: [""],
		active: 0,
		startedAt: null,
		elapsed: 0,
		done: !1,
		hit: 0,
		all: 0,
		samples: []
	};
}
function h(e, t) {
	switch (t.kind) {
		case "reset": return m(t.test ?? {
			words: e.words,
			source: e.source
		});
		case "type": {
			if (e.done) return e;
			let n = e.startedAt === null ? {
				...e,
				startedAt: t.now
			} : e;
			for (let e of t.text) n = g(n, e, t.now);
			return n;
		}
		case "back": {
			if (e.done) return e;
			let n = e.typed[e.active] ?? "";
			if (n.length === 0) return e.active === 0 ? e : {
				...e,
				active: e.active - 1
			};
			let r = e.typed.slice();
			return r[e.active] = t.whole ? "" : n.slice(0, -1), {
				...e,
				typed: r
			};
		}
		case "tick": {
			if (e.startedAt === null || e.done) return e;
			let n = (t.now - e.startedAt) / 1e3;
			if (n >= t.limit) return {
				...e,
				elapsed: t.limit,
				done: !0,
				samples: v(e, t.limit)
			};
			let r = Math.floor(n);
			return {
				...e,
				elapsed: n,
				samples: e.samples.length >= r ? e.samples : v(e, r)
			};
		}
	}
}
function g(e, t, n) {
	let r = e.words[e.active] ?? "", i = e.typed[e.active] ?? "", a = e.active === e.words.length - 1;
	if (t === " ") {
		if (i.length === 0) return e;
		let t = e.typed.slice();
		t[e.active + 1] = t[e.active + 1] ?? "";
		let o = {
			...e,
			typed: t,
			hit: e.hit + +(i === r),
			all: e.all + 1
		};
		return a ? _(o, n) : {
			...o,
			active: e.active + 1
		};
	}
	if (t < " " || i.length >= r.length + d) return e;
	let o = e.typed.slice();
	o[e.active] = i + t;
	let s = {
		...e,
		typed: o,
		hit: e.hit + +(t === r[i.length]),
		all: e.all + 1
	};
	return a && o[e.active] === r ? _(s, n) : s;
}
function _(e, t) {
	let n = e.startedAt === null ? 0 : (t - e.startedAt) / 1e3;
	return {
		...e,
		done: !0,
		elapsed: n,
		samples: v(e, n)
	};
}
function v(e, t) {
	if (t < 1) return e.samples;
	let { correct: n, wrong: r } = y(e.words, e.typed, e.active);
	return [...e.samples, {
		second: t,
		wpm: b(n, t),
		raw: b(n + r, t)
	}];
}
function y(e, t, n) {
	let r = 0, i = 0, a = 0;
	for (let o = 0; o <= n && o < e.length; o++) {
		let s = e[o], c = t[o] ?? "";
		for (let e = 0; e < c.length; e++) e < s.length && c[e] === s[e] ? r++ : i++;
		o < n && (c.length < s.length && (a += s.length - c.length), c === s && r++);
	}
	return {
		correct: r,
		wrong: i,
		missed: a
	};
}
function b(e, t) {
	let n = Math.max(t, 1);
	return e / 5 * (60 / n);
}
//#endregion
//#region src/Typing.tsx
function x({ lead: c, title: l, blurb: d, defaultMode: f = "words", defaultSeconds: g = 30, durations: _ = u, words: v, passages: x, onFinish: C, className: w } = {}) {
	let [T, E] = a(f), [D, O] = a(g), [k, A] = r(h, null, () => m(p(f, {
		words: v,
		passages: x
	}))), j = (e) => p(e, {
		words: v,
		passages: x
	}), [M, N] = a(!0), { active: P, done: F, elapsed: I, samples: L, startedAt: R, typed: z, words: B } = k, V = R !== null && !F, H = T === "words" ? D : Infinity, U = i(null), W = i(null), G = i(null), K = () => U.current?.focus(), q = (e) => {
		A({
			kind: "reset",
			test: e ? j(T) : void 0
		}), K();
	}, ee = (e) => {
		let t = e.target.value;
		e.target.value = "", t && A({
			kind: "type",
			text: t,
			now: performance.now()
		});
	}, te = (e) => {
		if (e.key === "Tab" && !e.shiftKey) {
			e.preventDefault(), q(!0);
			return;
		}
		if (e.key === "Escape") {
			e.preventDefault(), q(!1);
			return;
		}
		if (e.key === "Enter") {
			e.preventDefault(), F && q(!0);
			return;
		}
		e.key === "Backspace" && (e.preventDefault(), A({
			kind: "back",
			whole: e.altKey || e.ctrlKey || e.metaKey
		}));
	};
	e(() => {
		let e = (e) => {
			let t = U.current;
			t && document.activeElement !== t && (e.metaKey || e.ctrlKey || e.altKey || e.key.length === 1 && (e.preventDefault(), t.focus(), A({
				kind: "type",
				text: e.key,
				now: performance.now()
			})));
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, []), e(K, []), e(() => {
		if (R === null || F) return;
		let e = window.setInterval(() => A({
			kind: "tick",
			now: performance.now(),
			limit: H
		}), 100);
		return () => window.clearInterval(e);
	}, [
		F,
		H,
		R
	]);
	let [ne, re] = a(0), [J, ie] = a({
		x: 0,
		y: 0,
		h: 0
	}), [ae, oe] = a(0), [Y, se] = a(null);
	e(() => {
		if (!Y || typeof ResizeObserver > "u") return;
		let e = new ResizeObserver(([e]) => oe(e.contentRect.width));
		return e.observe(Y), () => e.disconnect();
	}, [Y]), t(() => {
		let e = G.current, t = W.current;
		if (!e || !t) return;
		let n = t.offsetHeight;
		re(Math.max(0, t.offsetTop - n)), ie({
			x: e.offsetLeft,
			y: e.offsetTop,
			h: n
		});
	}, [
		P,
		F,
		z,
		ae,
		B
	]);
	let X = n(() => y(B, z, P), [
		P,
		z,
		B
	]), Z = R === null ? 0 : b(X.correct, I), ce = R === null ? 0 : b(X.correct + X.wrong, I), Q = k.all === 0 ? 100 : Math.round(k.hit / k.all * 100), le = T === "words" ? Math.min(1, I / D) : Math.min(1, P / Math.max(1, B.length)), $ = i(null), ue = i(C);
	e(() => {
		ue.current = C, $.current = {
			wpm: Z,
			raw: ce,
			accuracy: Q,
			seconds: I,
			correct: X.correct,
			wrong: X.wrong,
			missed: X.missed,
			mode: T,
			samples: L
		};
	}), e(() => {
		F && $.current && ue.current?.($.current);
	}, [F]);
	let de = n(() => B.map((e, t) => {
		let n = z[t] ?? "", r = t === P && !F, i = n.length > e.length ? n.slice(e.length) : "";
		return /* @__PURE__ */ s("span", {
			className: r ? "ty-word ty-word--here" : "ty-word",
			ref: r ? W : void 0,
			children: [
				[...e].map((e, i) => {
					let a = n[i];
					return /* @__PURE__ */ o("span", {
						className: `ty-c ty-c--${a === void 0 ? t < P ? "skip" : "idle" : a === e ? "ok" : "bad"}`,
						ref: r && i === n.length ? G : void 0,
						children: e
					}, i);
				}),
				[...i].map((t, i) => /* @__PURE__ */ o("span", {
					className: "ty-c ty-c--over",
					ref: r && e.length + i === n.length ? G : void 0,
					children: t
				}, `+${i}`)),
				/* @__PURE__ */ o("span", {
					"aria-hidden": "true",
					className: "ty-c ty-c--tail",
					ref: r && n.length >= e.length + i.length ? G : void 0
				})
			]
		}, t);
	}), [
		P,
		F,
		z,
		B
	]), fe = (e) => {
		E(e), A({
			kind: "reset",
			test: j(e)
		}), K();
	}, pe = (e) => {
		O(e), A({
			kind: "reset",
			test: j(T)
		}), K();
	};
	return /* @__PURE__ */ s("section", {
		className: w ? `ty ${w}` : "ty",
		children: [
			(c || l || d) && /* @__PURE__ */ s("header", {
				className: "ty-head",
				children: [
					c,
					l && /* @__PURE__ */ o("h1", {
						className: "ty-title",
						children: l
					}),
					d && /* @__PURE__ */ o("p", {
						className: "ty-sub",
						children: d
					})
				]
			}),
			/* @__PURE__ */ s("div", {
				className: V ? "ty-bar ty-bar--away" : "ty-bar",
				children: [/* @__PURE__ */ s("div", {
					className: "ty-seg",
					role: "group",
					"aria-label": "Text",
					children: [/* @__PURE__ */ o("button", {
						className: T === "words" ? "ty-opt ty-opt--on" : "ty-opt",
						onClick: () => fe("words"),
						type: "button",
						children: "words"
					}), /* @__PURE__ */ o("button", {
						className: T === "prose" ? "ty-opt ty-opt--on" : "ty-opt",
						onClick: () => fe("prose"),
						type: "button",
						children: "passage"
					})]
				}), T === "words" && /* @__PURE__ */ o("div", {
					className: "ty-seg",
					role: "group",
					"aria-label": "Length",
					children: _.map((e) => /* @__PURE__ */ s("button", {
						className: D === e ? "ty-opt ty-opt--on" : "ty-opt",
						onClick: () => pe(e),
						type: "button",
						children: [e, "s"]
					}, e))
				})]
			}),
			/* @__PURE__ */ s("div", {
				className: V ? "ty-stage ty-stage--live" : "ty-stage",
				children: [
					!F && /* @__PURE__ */ s("div", {
						className: "ty-read",
						children: [
							/* @__PURE__ */ o("span", {
								className: "ty-read__clock",
								children: T === "words" ? `${Math.ceil(Math.max(0, D - I))}s` : `${Math.min(P + 1, B.length)}/${B.length}`
							}),
							/* @__PURE__ */ s("span", {
								className: "ty-read__stat",
								children: [/* @__PURE__ */ o("b", { children: Math.round(Z) }), " wpm"]
							}),
							/* @__PURE__ */ s("span", {
								className: "ty-read__stat",
								children: [/* @__PURE__ */ o("b", { children: Q }), "% acc"]
							})
						]
					}),
					F ? /* @__PURE__ */ o(S, {
						accuracy: Q,
						count: X,
						elapsed: I,
						onAgain: () => q(!1),
						onNew: () => q(!0),
						raw: ce,
						samples: L,
						speed: Z
					}) : /* @__PURE__ */ s("div", {
						className: M ? "ty-field" : "ty-field ty-field--blur",
						onClick: K,
						children: [/* @__PURE__ */ o("div", {
							className: "ty-view",
							children: /* @__PURE__ */ s("div", {
								className: "ty-track",
								ref: se,
								style: { transform: `translateY(${-ne}px)` },
								children: [de, /* @__PURE__ */ o("span", {
									className: V ? "ty-caret ty-caret--live" : "ty-caret",
									style: {
										height: `${J.h}px`,
										transform: `translate(${J.x}px, ${J.y}px)`
									}
								})]
							})
						}), /* @__PURE__ */ o("p", {
							className: "ty-wake",
							children: "click here, or just start typing"
						})]
					}),
					/* @__PURE__ */ o("div", {
						className: "ty-progress",
						"aria-hidden": "true",
						children: /* @__PURE__ */ o("span", { style: { transform: `scaleX(${le})` } })
					})
				]
			}),
			/* @__PURE__ */ s("div", {
				className: "ty-foot",
				children: [/* @__PURE__ */ s("p", {
					className: "ty-hint",
					children: [
						/* @__PURE__ */ o("kbd", { children: "tab" }),
						" new text ",
						/* @__PURE__ */ o("span", {
							"aria-hidden": "true",
							children: "·"
						}),
						" ",
						/* @__PURE__ */ o("kbd", { children: "esc" }),
						" restart"
					]
				}), k.source && !F && /* @__PURE__ */ o("p", {
					className: "ty-source",
					children: k.source
				})]
			}),
			/* @__PURE__ */ o("input", {
				"aria-label": "Typing test",
				autoCapitalize: "off",
				autoComplete: "off",
				autoCorrect: "off",
				className: "ty-input",
				onBlur: () => N(!1),
				onChange: ee,
				onFocus: () => N(!0),
				onKeyDown: te,
				ref: U,
				spellCheck: !1
			})
		]
	});
}
function S({ accuracy: e, count: t, elapsed: n, onAgain: r, onNew: i, raw: a, samples: c, speed: l }) {
	return /* @__PURE__ */ s("div", {
		className: "ty-result",
		children: [
			/* @__PURE__ */ s("div", {
				className: "ty-score",
				children: [/* @__PURE__ */ o("p", {
					className: "ty-score__label",
					children: "words per minute"
				}), /* @__PURE__ */ o("p", {
					className: "ty-score__value",
					children: Math.round(l)
				})]
			}),
			/* @__PURE__ */ o(C, { samples: c }),
			/* @__PURE__ */ s("dl", {
				className: "ty-facts",
				children: [
					/* @__PURE__ */ s("div", {
						className: "ty-fact",
						children: [/* @__PURE__ */ o("dt", { children: "accuracy" }), /* @__PURE__ */ s("dd", { children: [e, "%"] })]
					}),
					/* @__PURE__ */ s("div", {
						className: "ty-fact",
						children: [/* @__PURE__ */ o("dt", { children: "raw" }), /* @__PURE__ */ o("dd", { children: Math.round(a) })]
					}),
					/* @__PURE__ */ s("div", {
						className: "ty-fact",
						children: [/* @__PURE__ */ o("dt", { children: "characters" }), /* @__PURE__ */ s("dd", { children: [
							t.correct,
							/* @__PURE__ */ o("span", {
								className: "ty-fact__slash",
								children: "/"
							}),
							/* @__PURE__ */ o("span", {
								className: "ty-fact__bad",
								children: t.wrong + t.missed
							})
						] })]
					}),
					/* @__PURE__ */ s("div", {
						className: "ty-fact",
						children: [/* @__PURE__ */ o("dt", { children: "time" }), /* @__PURE__ */ s("dd", { children: [n.toFixed(1), "s"] })]
					})
				]
			}),
			/* @__PURE__ */ s("div", {
				className: "ty-again",
				children: [/* @__PURE__ */ o("button", {
					className: "ty-go ty-go--lead",
					onClick: r,
					type: "button",
					children: "Again"
				}), /* @__PURE__ */ o("button", {
					className: "ty-go",
					onClick: i,
					type: "button",
					children: "New text"
				})]
			})
		]
	});
}
function C({ samples: e }) {
	if (e.length < 2) return null;
	let t = Math.max(50, ...e.map((e) => e.raw)) * 1.12, n = e[0].second, r = e[e.length - 1].second - n || 1, i = (e) => 12 + (e.second - n) / r * 596, a = (e) => 120 - e / t * 108, c = (t) => e.map((e, n) => `${n === 0 ? "M" : "L"}${i(e).toFixed(1)} ${a(t(e)).toFixed(1)}`).join(" "), l = c((e) => e.wpm);
	return /* @__PURE__ */ s("svg", {
		className: "ty-curve",
		preserveAspectRatio: "none",
		role: "img",
		"aria-label": `Speed across ${Math.round(r)} seconds`,
		viewBox: "0 0 620 132",
		children: [
			/* @__PURE__ */ o("defs", { children: /* @__PURE__ */ s("linearGradient", {
				id: "ty-fill",
				x1: "0",
				x2: "0",
				y1: "0",
				y2: "1",
				children: [/* @__PURE__ */ o("stop", {
					offset: "0%",
					stopColor: "rgba(251, 109, 76, 0.34)"
				}), /* @__PURE__ */ o("stop", {
					offset: "100%",
					stopColor: "rgba(251, 109, 76, 0)"
				})]
			}) }),
			/* @__PURE__ */ o("path", {
				className: "ty-curve__area",
				d: `${l} L${608 .toFixed(1)} 120 L${12 .toFixed(1)} 120 Z`,
				fill: "url(#ty-fill)"
			}),
			/* @__PURE__ */ o("path", {
				className: "ty-curve__raw",
				d: c((e) => e.raw),
				fill: "none"
			}),
			/* @__PURE__ */ o("path", {
				className: "ty-curve__net",
				d: l,
				fill: "none"
			})
		]
	});
}
//#endregion
//#region src/sky.ts
var w = [
	"255, 255, 255",
	"255, 255, 255",
	"255, 255, 255",
	"198, 219, 255",
	"255, 224, 196",
	"255, 186, 158"
], T = .055, E = .08, D = .1, O = .045, k = .055, A = .85, j = .85, M = 1900, N = 230, P = 760, F = (e, t) => e + Math.random() * (t - e);
function I(e, t) {
	do
		e.x = F(-1, 1), e.y = F(-1, 1);
	while (e.x * e.x + e.y * e.y > 1);
	return e.z = F(t ? T : .92, 1), e.mag = F(.35, 1), e.tint = Math.floor(Math.random() * w.length), e;
}
function L(e) {
	let t = e.getContext("2d", { alpha: !0 });
	if (!t) return {
		kick: () => {},
		stop: () => {}
	};
	let n = window.matchMedia("(prefers-reduced-motion: reduce)"), r = [], i = 0, a = 0, o = 0, s = 0, c = 0, l = 0, u = 0, d = 0, f = !1;
	function p() {
		let n = Math.min(window.devicePixelRatio || 1, 2);
		i = e.clientWidth, a = e.clientHeight, e.width = Math.round(i * n), e.height = Math.round(a * n), t.setTransform(n, 0, 0, n, 0, 0), o = Math.min(i, a) * .32;
		let s = Math.round(Math.max(N, Math.min(P, i * a / M)));
		for (; r.length > s;) r.pop();
		for (; r.length < s;) r.push(I({
			x: 0,
			y: 0,
			z: 0,
			mag: 0,
			tint: 0
		}, !0));
	}
	function m(e) {
		l += e;
		let n = i / 2 + Math.sin(l * .07) * i * .05, s = a / 2 + Math.cos(l * .052) * a * .055, u = Math.min(1, Math.max(0, c - O) / A), d = c * E * (D + .9 * u);
		t.clearRect(0, 0, i, a), t.lineCap = "round";
		for (let l of r) {
			l.z -= c * e, l.z <= T && I(l, !1);
			let { x: r, y: u, z: f } = l, p = o / f, m = n + r * p, h = s + u * p;
			if (m < -200 || m > i + 200 || h < -200 || h > a + 200) continue;
			let g = 1 - f, _ = l.mag * Math.min(1, g * 4.2) * (.34 + g * .66);
			if (_ <= .01) continue;
			let v = w[l.tint], y = .55 + g * g * 2.4, b = o / Math.min(1, f + d), x = n + r * b, S = s + u * b, C = m - x, E = h - S;
			C * C + E * E > 2.25 ? (t.strokeStyle = `rgba(${v}, ${_})`, t.lineWidth = y, t.beginPath(), t.moveTo(x, S), t.lineTo(m, h), t.stroke()) : (t.fillStyle = `rgba(${v}, ${_})`, t.fillRect(m - y / 2, h - y / 2, y, y));
		}
	}
	function h(e) {
		if (!f) return;
		let t = Math.min(.05, (e - d) / 1e3 || 0);
		d = e, s *= Math.exp(-t / j), s < .001 && (s = 0);
		let n = O + s;
		c += (n - c) * Math.min(1, t * 6), m(t), u = requestAnimationFrame(h);
	}
	function g() {
		f || n.matches || (f = !0, d = performance.now(), u = requestAnimationFrame(h));
	}
	function _() {
		f = !1, cancelAnimationFrame(u);
	}
	function v() {
		document.hidden ? _() : g();
	}
	function y() {
		_(), p(), c = O, m(0);
	}
	function b() {
		p(), n.matches && m(0);
	}
	function x() {
		n.matches ? y() : g();
	}
	return p(), n.matches ? y() : g(), window.addEventListener("resize", b), document.addEventListener("visibilitychange", v), n.addEventListener("change", x), {
		kick: () => {
			n.matches || (s = Math.min(A, s + k));
		},
		stop: () => {
			_(), window.removeEventListener("resize", b), document.removeEventListener("visibilitychange", v), n.removeEventListener("change", x), r = [];
		}
	};
}
//#endregion
//#region src/Starfield.tsx
function R() {
	let t = i(null);
	return e(() => {
		let e = t.current;
		if (!e) return;
		let n = L(e), r = (e) => {
			e.metaKey || e.ctrlKey || e.altKey || (e.key.length === 1 || e.key === "Backspace") && n.kick();
		};
		return window.addEventListener("keydown", r), () => {
			window.removeEventListener("keydown", r), n.stop();
		};
	}, []), /* @__PURE__ */ s("div", {
		className: "sky",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ o("div", { className: "sky__cloud sky__cloud--far" }),
			/* @__PURE__ */ o("div", { className: "sky__cloud sky__cloud--mid" }),
			/* @__PURE__ */ o("div", { className: "sky__cloud sky__cloud--near" }),
			/* @__PURE__ */ o("canvas", {
				className: "sky__stars",
				ref: t
			}),
			/* @__PURE__ */ o("div", { className: "sky__veil" })
		]
	});
}
//#endregion
export { u as DURATIONS, l as PASSAGES, R as Starfield, x as Typing, c as WORDS, p as buildTest, h as reduce, m as start, y as tally, b as wpm };

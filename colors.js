function Color(color) {
	'use strict';
	if (!color) {
		throw new TypeError('color must not be null');
	}
	if (Color.isRGB(color)) {
		this._rgb = color;
	} else if (Color.isHEX(color)) {
		this._hex = '#' + color.replace('#', '');
		this._rgb = Color.HEXtoRGB(color);
	} else if (Color.isHSL(color)) {
		this._hsl = color;
		this._rgb = Color.HSLtoRGB(color);
	} else {
		throw new TypeError('Color not detected');
	}
}

(function() {
	'use strict';
	Color.prototype.rgb = function() {
		return {
			r: this._rgb.r,
			g: this._rgb.g,
			b: this._rgb.b
		};
	};
	Color.prototype.hex = function() {
		if (!this._hex) {
			this._hex = Color.RGBtoHEX(this._rgb);
		}
		return this._hex;
	};
	Color.prototype.hsb = Color.prototype.hsv = function() {
		if (!this._hsv) {
			this._hsv = Color.RGBtoHSV(this._rgb);
		}
		return {
			h: this._hsv.h,
			s: this._hsv.s,
			v: this._hsv.v
		};
	};
	Color.prototype.hsl = function() {
		if (!this._hsl) {
			this._hsl = Color.RGBtoHSL(this._rgb);
		}
		return {
			h: this._hsl.h,
			s: this._hsl.s,
			l: this._hsl.l
		};
	};

	Color.prototype.brighten = function(amount) {
		amount /= 100;
		var hsl = this.hsl();
		hsl.l += (100 - hsl.l) * amount;
		hsl.l = Math.min(100, Math.max(0, hsl.l));
		return new Color(hsl);
	};

	Color.prototype.darken = function(amount) {
		amount /= 100;
		var hsl = this.hsl();
		hsl.l -= hsl.l * amount;
		hsl.l = Math.min(100, Math.max(0, hsl.l));
		return new Color(hsl);
	};
})();

(function() {
	'use strict';
	Color.format = function(color) {
		if (Color.isRGB(color)) {
			return {
				r: parseInt(color.r.toFixed(0), 10),
				g: parseInt(color.g.toFixed(0), 10),
				b: parseInt(color.b.toFixed(0), 10)
			};
		}
		return color;
	};

	var hexdec = function(hex) {
		return parseInt(hex, 16);
	};
	var dechex = function(dec) {
		var rtrn = parseInt(dec, 10).toString(16);
		return (rtrn.length === 2 ? rtrn : 0 + rtrn);
	};

	Color.isHEX = function(value) {
		return (typeof(value) === 'string' && value.search) &&
			(value.search(/^#?[a-fA-F\d]{6}$/) === 0 ||
				value.search(/^#?[a-fA-F\d]{3}$/) === 0);
	};

	Color.isRGB = function(value) {
		if (!value || typeof(value) !== 'object' ||
		!value.hasOwnProperty('r') || value.r < 0 || value.r > 255 ||
		!value.hasOwnProperty('g') || value.g < 0 || value.g > 255 ||
		!value.hasOwnProperty('b') || value.b < 0 || value.b > 255 ) {
			return false;
		}
		return true;
	};
	Color.isHSL = function(value) {
		return (value.h !== null &&
			value.s !== null &&
			value.l !== null);
	};
	Color.isHSB = function(value) {
		return (value.h !== null &&
			value.s !== null &&
			value.b !== null);
	};
	Color.isHSV = function(value) {
		return (value.h !== null &&
			value.s !== null &&
			value.v !== null);
	};

	Color.HEXtoRGB = function(hex) {
		if (!Color.isHEX(hex)) {
			throw new TypeError('Invalid param:' + hex);
		}
		hex = hex.replace('#', '');
		if (hex.length == 3) {
			return {
				r: hexdec(hex[0] + hex[0]),
				g: hexdec(hex[1] + hex[1]),
				b: hexdec(hex[2] + hex[2])
			};
		} else if (hex.length == 6) {
			return {
				r: hexdec(hex[0] + hex[1]),
				g: hexdec(hex[2] + hex[3]),
				b: hexdec(hex[4] + hex[5])
			};
		} else {
			throw new Error('Bad hex code');
		}
	};

	Color.RGBtoHEX = function(rgb) {
		if (!Color.isRGB(rgb)) {
			throw new TypeError('Invalid param');
		}
		return [
			'#',
			dechex(rgb.r.toFixed(0)),
			dechex(rgb.g.toFixed(0)),
			dechex(rgb.b.toFixed(0))
		].join('');
	};

	Color.RGBtoHSL = function(rgb) {
		if (!Color.isRGB(rgb)) {
			throw new TypeError('Invalid param');
		}

		var r = rgb.r / 255,
			g = rgb.g / 255,
			b = rgb.b / 255;

		var min = Math.min(r, Math.min(g, b));
		var max = Math.max(r, Math.max(g, b));

		var h = 0, s = 0, l = (max + min) / 2;

		if (min != max) {
			if (l < 0.5) {
				s = (max - min) / (max + min);
			} else {
				s = (max - min) / (2 - max - min);
			}
			if (r == max) {
				h = (g - b) / (max - min);
			} else if (g == max) {
				h = 2.0 + (b - r) / (max - min);
			} else if (b == max) {
				h = 4.0 + (r - g) / (max - min);
			}
			h *= 60;
			if (h < 0) { h += 360; }
		}
		return {
			h:parseInt(h.toFixed(0), 10),
			s:parseInt((s*100).toFixed(0), 10),
			l:parseInt((l*100).toFixed(0), 10)
		};
	};

	Color.HSLtoRGB = function(hsl) {
		if (!Color.isHSL(hsl)) {
			throw new TypeError('Invalid param');
		}

		var h = hsl.h,
			s = hsl.s / 100,
			l = hsl.l / 100;

		if (s === 0) {
			l *= 255;
			return {
				r: l,
				g: l,
				b: l
			};
		} else {
			var temp2;

			if (l < 0.5) {
				temp2 = l * (1.0 + s);
			} else {
				temp2 = l + s - (l*s);
			}
			h /= 360;
			var temp1 = 2.0* l - temp2,
			temp3 = {
				r: h + 1.0 / 3.0,
				g: h,
				b: h - 1.0 / 3.0
			};
			var out = {'r':1, 'g':1, 'b':1};
			for(var v in out) {
				temp3[v] = (temp3[v] < 0 ? temp3[v] + 1.0 : (temp3[v] > 1 ? temp3[v] - 1.0 : temp3[v]));

				if (6.0 * temp3[v] < 1) {
					out[v] = temp1 + (temp2 - temp1) * 6.0 * temp3[v];
				} else if (2.0 * temp3[v] < 1) {
					out[v] = temp2;
				} else if (3.0 * temp3[v] < 2) {
					out[v] = temp1 + (temp2 - temp1) * ((2.0/3.0) - temp3[v]) * 6.0;
				} else {
					out[v] = temp1;
				}

				out[v] = parseInt((out[v] * 255).toFixed(0), 10);
			}

			return out;
		}
	};
})();


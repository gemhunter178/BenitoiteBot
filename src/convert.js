import { gFunc } from './_generalFunctions.js';

export function CONVERT(client, channel, user, text) {
  let msg;
  let helpTrg = 0;
  if (/\bhelp\b/i.test(text) || text.length === 0) {
    helpTrg = 1;
    if (/\btemp/i.test(text)) {
      helpTrg = 3;
    } else if (/\blen/i.test(text)) {
      helpTrg = 4;
    } else if (/\bvol/i.test(text)) {
      helpTrg = 5;
    } else if (/\bmass|\bwei/i.test(text)) {
      helpTrg = 6;
    } else if (/\barea/i.test(text)) {
      helpTrg = 7;
    } else if (/\btime/i.test(text)) {
      helpTrg = 8;
    }
  } else if (/\bdebug\b/.test(text)) {
    helpTrg = -2;
    text = text.replace(/\bdebug\b/, '');
    text = text.replace(/\s\s+/g, ' ');
    if (text.charAt(0) === ' ') {
      text = text.substr(1);
    }
    if (text.charAt(-1) === ' ') {
      text = text.slice(0, -1);
    }
  }

  text = text.replace(/\s+to\s+/i, ' ');
  text = text.replace(/\bcubic\s+/ig, 'cubic');
  text = text.replace(/\bsquare\s+/ig, 'square');
  const cvrtvals = text.split(' ');
  if (cvrtvals.length < 2 && helpTrg === 0) {
    helpTrg = 2;
  } else if (cvrtvals.length > 2) {
    cvrtvals[0] += cvrtvals[1];
    cvrtvals[1] = cvrtvals[2];
  }
  
  let val = parseFloat(cvrtvals[0]);
  const getUnitRegex = /^[\d.-]*/;

  if (isNaN(val) && (helpTrg === 0 || helpTrg === -2)) {
    val = 1;
  } 
  if (/^format_time$|^time$|^f_t$/.test(cvrtvals[0])) {
    helpTrg = -1;
  }
  
  const gaboVal = 1.8288 * 73 / 72;
  const conversions = (function () {
    const factor = i => ({
        from: j => j * i,
        to: j => j / i
      });
    return {
      temperature: {
        C: factor(1),
        F: {
          from: val => (val - 32) * 5 / 9,
          to: val => val * 1.8 + 32
        },
        K: {
          from: val => val - 273.15,
          to: val => val + 273.15
        },

        Celsius: 'C',
        celsius: 'C',
        Fahrenheit: 'F',
        fahrenheit: 'F',
        Kelvin: 'K',
        kelvin: 'K'
      },
      length: {
        m: factor(1),
        cm: factor(1 / 100),
        mm: factor(1 / 1000),
        µm: factor(1 / 1000000),
        km: factor(1000),
        yd: factor(0.9144),
        ft: factor(0.3048),
        in: factor(0.0254),
        mi: factor(1609.344),
        twip: { suffix: ' twips (typographical)', ...factor(0.0254 / 1440) },
        point: { suffix: ' point (typographical)', ...factor(0.0254 / 72) },
        line: { suffix: ' ln (using 1/12 inch definition, obsolete)', ...factor(0.0254 / 12) },
        poppyseed: { suffix: ' poppyseeds (using 1/4 barleycorn definition, obsolete)', ...factor(0.0254 / 12) },
        pica: { suffix: ' picas (typographical)', ...factor(0.0254 / 6) },
        barleycorn: { suffix: ' barleycorns', ...factor(0.0254 / 3) },
        digit: { suffix: ' digits (English, obsolete)', ...factor(0.01905) },
        finger: { suffix: ' finger (obsolete)', ...factor(0.022225) },
        nail: { suffix: ' nails (used for cloth)', ...factor(0.05715) },
        palm: { suffix: ' palms (obsolete)', ...factor(0.0762) },
        hand: { suffix: ' hands (used for horses)', ...factor(0.1016) },
        shaftment: { suffix: ' shaftments (obsolete)', ...factor(0.1524) },
        link: { suffix: ' links (1/100 of a chain)', ...factor(0.201168) },
        span: { suffix: ' spans', ...factor(0.2286) },
        cubit: { suffix: ' cubits (obsolete)', ...factor(0.4572) },
        ell: { suffix: ' ells (english, tailoring, obsolete)', ...factor(1.143) },
        fathom: { suffix: ' fathoms', ...factor(1.8288) },
        rod: { suffix: ' rod/perch/pole (surveying, obsolete)', ...factor(19800 / 3937) },
        chain: { suffix: ' chains (Gunter\'s)', ...factor(20.1168) },
        furlong: { suffix: ' furlongs', ...factor(201.168) },
        nau_mile: { suffix: ' nautical miles', ...factor(1852) },
        league: { suffix: ' nautical leagues', ...factor(5556) },
        surveyfoot: { suffix: ' US survey feet', ...factor(1200 / 3937) },
        ligne: { suffix: ' Paris line (watchmaking)', ...factor(0.002255829062297) },
        'light-seconds': { suffix: ' light-seconds', ...factor(299792458) },
        micron: { suffix: ' microns', ...factor(1 / 1000000) },
        AWG: {
          suffix: ' American Wire Gauge',
          from: val => 0.000127 * 92 ** ((36 - val) / 39),
          to: val => -39 * Math.log(val / 0.000127) / Math.log(92) + 36
        },
        au: { suffix: ' astronomical units', ...factor(149597870700) },
        gabo: { suffix: ' gabos', ...factor(gaboVal) },
        smoot: { suffix: ' smoots', ...factor(1.7018) },

        meter: 'm',
        meters: 'm',
        centimeter: 'cm',
        centimeters: 'cm',
        millimeter: 'mm',
        millimeters: 'mm',
        micrometer: 'µm',
        micrometers: 'µm',
        um: 'µm',
        kilometer: 'km',
        kilometers: 'km',
        kilometre: 'km',
        kilometres: 'km',
        yard: 'yd',
        yards: 'yd',
        foot: 'ft',
        feet: 'ft',
        inch: 'in',
        inches: 'in',
        mile: 'mi',
        miles: 'mi',
        twips: 'twip',
        DTPpoint: 'point',
        lines: 'line',
        poppyseeds: 'poppyseed',
        picas: 'pica',
        barleycorns: 'barleycorn',
        hands: 'hand',
        spans: 'span',
        fathoms: 'fathom',
        perch: 'rod',
        pole: 'rod',
        furlongs: 'furlong',
        nauticalmile: 'nau_mile',
        nauticalmiles: 'nau_mile',
        leagues: 'league',
        µ: 'micron',
        microns: 'micron',
        gauge: 'AWG',
        gaugewire: 'AWG',
        astronomicalunits: 'au',
        gabos: 'gabo',
        smoots: 'smoot'
      },
      volume: {
        L: factor(1),
        mL: factor(0.001),
        'm^3': { suffix: ' cubic meters', ...factor(1000) },
        'cm^3': { suffix: ' cubic centimeters', ...factor(0.001) },
        imp_gal: { suffix: ' gallons (imperial)', ...factor(4.54609) },
        gal: { suffix: ' gallons (US)', ...factor(3.785411784) },
        pottle: { suffix: ' pottle (US, obsolete)', ...factor(1.892705892) },
        qt: { suffix: ' quarts (US)', ...factor(0.946352946) },
        pt: { suffix: ' pints (US)', ...factor(0.473176473) },
        c: { suffix: ' cups (US)', ...factor(0.2365882365) },
        gill: { suffix: ' gill (US)', ...factor(0.11829411825) },
        floz: { suffix: ' fluid ounces (US)', ...factor(0.0295735295625) },
        tsp: { suffix: ' teaspoons (US)', ...factor(0.00492892159375) },
        Tbsp: { suffix: ' Tablespoons (US)', ...factor(0.01478676478125) },
        fldram: { suffix: ' fluid drams (US)', ...factor(0.0036966911953125) },
        minim: { suffix: ' min', ...factor(0.000061611519921875) },
        firkin: { suffix: ' firkins (imperial)', ...factor(40.91481) },
        bushel: { suffix: ' bushels', ...factor(35.23907) },
        stick_of_butter: { suffix: ' US sticks of butter', ...factor(0.11829411825) },
        cord: { suffix: ' cords (firewood)', ...factor(3624.556363776) },
        bdft: { suffix: ' board feet (lumber)', ...factor(2.359737216) },
        'gabo^3': {
          suffix: ' cubic gabos',
          from: val => val * (gaboVal ** 3) * 1000,
          to: val => (val / 1000) / (gaboVal ** 3)
        },

        liter: 'L',
        liters: 'L',
        mil: 'mL',
        ml: 'mL',
        milliliter: 'mL',
        milliliters: 'mL',
        cubicmeter: 'm^3',
        cubicmeters: 'm^3',
        cubicm: 'm^3',
        cc: 'cm^3',
        cubiccentimeter: 'cm^3',
        cubiccentimeters: 'cm^3',
        cubiccm: 'cm^3',
        imperialgal: 'imp_gal',
        impgal: 'imp_gal',
        gallon: 'gal',
        gallons: 'gal',
        quart: 'qt',
        quarts: 'qt',
        pint: 'pt',
        pints: 'pt',
        cup: 'c',
        cups: 'c',
        fluidounce: 'floz',
        fluidounces: 'floz',
        fl_oz: 'floz',
        teaspoon: 'tsp',
        teaspoons: 'tsp',
        tablespoon: 'Tbsp',
        tablespoons: 'Tbsp',
        fldrachm: 'fldram',
        fl_dram: 'fldram',
        bu: 'bushel',
        bushels: 'bushel',
        butter: 'stick_of_butter',
        butterstick: 'stick_of_butter',
        buttersticks: 'stick_of_butter',
        cords: 'cord',
        boardfoot: 'bdft',
        boardfeet: 'bdft',
        cubicgabo: 'gabo^3',
        cubicgabos: 'gabo^3'
      },
      massweight: {
        kg: factor(1),
        g: factor(1 / 1000),
        metric_ton: { suffix: ' metric tons', ...factor(1000) },
        ton: { suffix: ' tons (US)', ...factor(2000 / 2.20462262) },
        lbs: factor(1 / 2.20462262),
        oz: { suffix: ' ounces', ...factor(1 / 35.27396195) },
        ct: { suffix: ' carats', ...factor(0.0002) },
        stone: { suffix: ' stone', ...factor(1 / 0.15747) },
        grain: { suffix: ' grain', ...factor(0.00006479891) },
        dwt: { suffix: ' pennyweights (troy)', ...factor(0.00155517384) },
        troy_oz: { suffix: ' ounces (troy)', ...factor(0.0311034768) },
        troy_pound: { suffix: ' pounds (troy)', ...factor(0.37324172) },
        amu: { suffix: ' atomic mass units', ...factor(1 / 6.02217364335e+26) },
        Jupiter: { suffix: ' Jupiters', ...factor(1.898e+27) },
        solar_mass: { suffix: ' solar masses', ...factor(1.989e+30) },

        kgs: 'kg',
        kilogram: 'kg',
        kilograms: 'kg',
        gram: 'g',
        grams: 'g',
        tons: 'ton',
        tonne: 'metric_ton',
        tonnes: 'metric_ton',
        lb: 'lbs',
        pound: 'lbs',
        pounds: 'lbs',
        ozs: 'oz',
        ounce: 'oz',
        ounces: 'oz',
        carat: 'ct',
        carats: 'ct',
        pennyweight: 'dwt',
        pennyweights: 'dwt',
        oz_t: 'troy_oz',
        troy_ounce: 'troy_oz',
        lb_t: 'troy_pound',
        troy_lb: 'troy_pound',
        Jupiters: 'Jupiter',
        sun_mass: 'solar_mass'
      },
      area: {
        'm^2': {
          suffix: ' square meters',
          ...factor(1)
        },
        'cm^2': { suffix: ' square centimeters', ...factor(0.0001) },
        'km^2': { suffix: ' square kilometers', ...factor(1000000) },
        'ft^2': { suffix: ' square feet', ...factor(0.09290304) },
        'in^2': { suffix: ' square inches', ...factor(0.00064516) },
        square_rod: { suffix: ' square rod/perch/pole (obsolete)', ...factor(25.29285264) },
        ro: { suffix: ' roods (obsolete)', ...factor(1011.7141056) },
        acre: { suffix: ' acres', ...factor(4046.8564224) },
        hectare: { suffix: ' hectares', ...factor(10000) },
        bovate: { suffix: ' oxgangs (approx, obsolete)', ...factor(60000) },
        virgate: { suffix: ' virgates (approx, obsolete)', ...factor(120000) },
        carucate: { suffix: ' carucates (approx, obsolete)', ...factor(490000) },
        'gabo^2': {
          suffix: ' square gabos',
          from: val => val * (gaboVal ** 2),
          to: val => val / (gaboVal ** 2)
        },

        squaremeter: 'm^2',
        squaremeters: 'm^2',
        sqmeter: 'm^2',
        squarem: 'm^2',
        squarecentimeter: 'cm^2',
        squarecentimeters: 'cm^2',
        sqcm: 'cm^2',
        squarecm: 'cm^2',
        squarefoot: 'ft^2',
        squarefeet: 'ft^2',
        sqft: 'ft^2',
        squareft: 'ft^2',
        squareinch: 'in^2',
        squareinches: 'in^2',
        sqin: 'in^2',
        squarein: 'in^2',
        rood: 'ro',
        roods: 'ro',
        acres: 'acre',
        ha: 'hectare',
        hectares: 'hectare',
        oxgang: 'bovate',
        squaregabo: 'gabo^2',
        squaregabos: 'gabo^2',
        sqgabo: 'gabo^2'
      },
      time: {
        years: { suffix: ' non-leap years', ...factor(31536000) },
        weeks: { suffix: ' weeks', ...factor(604800) },
        days: { suffix: ' days', ...factor(86400) },
        hours: { suffix: ' hours', ...factor(3600) },
        minutes: { suffix: ' minutes', ...factor(60) },
        seconds: { suffix: ' seconds', ...factor(1) },
        sol: { suffix: ' sols (martian days)', ...factor(88775.24409) },
        fortnight: { suffix: ' fortnights', ...factor(1209600) },
        format_time: {
          suffix: '',
          to: val => Math.floor(val / 31536000) + 'y ' + Math.floor((val / 86400) % 365) + 'd ' + Math.floor((val / 3600) % 24) + 'h ' + Math.floor((val / 60) % 60) + 'm ' + (val % 60) + 's'
        },

        y: 'years',
        yr: 'years',
        yrs: 'years',
        year: 'years',
        w: 'weeks',
        wk: 'weeks',
        wks: 'weeks',
        week: 'weeks',
        d: 'days',
        dy: 'days',
        day: 'days',
        h: 'hours',
        hr: 'hours',
        hrs: 'hours',
        hour: 'hours',
        m: 'minutes',
        min: 'minutes',
        mins: 'minutes',
        minute: 'minutes',
        s: 'seconds',
        sec: 'seconds',
        secs: 'seconds',
        second: 'seconds',
        sols: 'sol',
        fortnights: 'fortnight',
        time: 'format_time',
        f_t: 'format_time'
      }
    };
  })();

  // returns all available units for a certain category
  function dispOptions (measureType) {
    let msgAdd = '';
    for (const attribute in measureType) {
      if (typeof measureType[attribute] !== 'string') {
        msgAdd += (attribute + ', ');
      }
    }
    msgAdd = msgAdd.substr(0, msgAdd.length - 2);
    return msgAdd;
  }

  if (helpTrg !== 0) {
    /* error handling, basically */
    switch (helpTrg) {
      case -2: {
        const dUnit1 = cvrtvals[0].replace(getUnitRegex, '');
        const dUnit2 = cvrtvals[1].replace(getUnitRegex, '');
        msg = 'debug: text- ' + text + ' | in0- ' + cvrtvals[0] + ' | in1- ' + cvrtvals[1] + ' | val- ' + val + ' | unit1- ' + dUnit1 + ' | unit2- ' + dUnit2;
        break;
      }

      case -1:
        msg = '\'format_time\' cannot be used as input here abbybaPensive ';
        break;

      case 2:
        msg = 'input format: "[val] [inputUnit] [outputUnit]" with spaces.';
        break;

      case 3:
        msg = 'current accepted units for temperature: ' + dispOptions(conversions.temperature);
        break;

      case 4:
        msg = 'current accepted units for length: ' + dispOptions(conversions.length);
        break;

      case 5:
        msg = 'current accepted units for volume: ' + dispOptions(conversions.volume);
        break;

      case 6:
        msg = 'current accepted units for mass/earth-relative weight: ' + dispOptions(conversions.massweight);
        break;

      case 7:
        msg = 'current accepted units for area: ' + dispOptions(conversions.area);
        break;

      case 8:
        msg = 'current accepted units for time: ' + dispOptions(conversions.time) + ' *format_time can only be used as output';
        break;

      default:
        msg = 'convert function by Gem. Input format: "[number] [inputUnit] [outputUnit]" or "help [unittype]" -> ' + dispOptions(conversions);
        break;
    }
  } else {
    let unit1 = cvrtvals[0].replace(getUnitRegex, '');
    let unit2 = cvrtvals[1].replace(getUnitRegex, '');
    let calc = false;
    const origVal = val;
    for (const attribute in conversions) {
      if (conversions[attribute].hasOwnProperty(unit1) && conversions[attribute].hasOwnProperty(unit2)) {
        if (typeof (conversions[attribute][unit1]) === 'string') { unit1 = conversions[attribute][unit1]; }
        if (typeof (conversions[attribute][unit2]) === 'string') { unit2 = conversions[attribute][unit2]; }
        val = conversions[attribute][unit1].from(val);
        if (conversions[attribute][unit1].suffix !== undefined) {
          unit1 = conversions[attribute][unit1].suffix;
        }
        val = conversions[attribute][unit2].to(val);
        if (conversions[attribute][unit2].suffix !== undefined) {
          unit2 = conversions[attribute][unit2].suffix;
        }
        calc = true;
        break;
      }
    }

    if (!calc) {
      // assuming the second unit is the issue
      for (const attribute in conversions) {
        if (conversions[attribute].hasOwnProperty(unit1)) {
          unit2 = gFunc.closestObjectAttribute(unit2, conversions[attribute])[0][1];
          if (typeof (conversions[attribute][unit1]) === 'string') { unit1 = conversions[attribute][unit1]; }
          if (typeof (conversions[attribute][unit2]) === 'string') { unit2 = conversions[attribute][unit2]; }
          val = conversions[attribute][unit1].from(val);
          if (conversions[attribute][unit1].suffix !== undefined) {
            unit1 = conversions[attribute][unit1].suffix;
          }
          val = conversions[attribute][unit2].to(val);
          if (conversions[attribute][unit2].suffix !== undefined) {
            unit2 = conversions[attribute][unit2].suffix;
          }
          calc = true;
          break;
        }
      }
    }

    if (!calc) {
      msg = 'Unknown unit \'' + unit1 + '\' ...did you check your capitalizations?';
    }

    if (calc) {
      if (typeof val === 'number') {
        val = (val.toPrecision(6)).replace(/\.0+\b/, '');
      }
      msg = origVal + unit1 + ' = ' + val + unit2;
    }
  }

  client.say(channel, msg);
}
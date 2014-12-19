function identity(x) {
  return x;
}

function r(index) {
  /* $0 is always 0 */
  if(index == 0) {
    return '0';
  }
  return 'r[' + index + ']';
}

var translations = {};

function baseTranslation(result, preop, operand1,
                         operator, operand2, postop) {
  /* instructions trying to write to $0 are simply ignored */
  if (result == 0) {
    return '';
  }
  return [
    r(result), '=', preop, operand1, operator, operand2, postop, ';'
  ].join('');
}

function immediateTranslation(operator) {
  return function(instruction) {
    return baseTranslation(
      instruction[1], '', r(instruction[2]), operator, instruction[3]
    );
  }
}

function operatorTranslation(operator) {
  return function(instruction) {
    return baseTranslation(
      instruction[1], '', r(instruction[2]), operator, r(instruction[3])
    );
  }
}

function functionImmediateTranslation(func) {
  return function(instruction) {
    return baseTranslation(
      instruction[1], func + '(', r(instruction[2]),
      ',', instruction[3], ')'
    );
  }
}

function functionTranslation(func) {
  return function(instruction) {
    return baseTranslation(
      instruction[1], func + '(', r(instruction[2]),
      ',', r(instruction[3]), ')'
    );
  }
}

function conditionalTranslation(predicate) {
  return function(instruction) {
    return baseTranslation(
      instruction[1], '', r(instruction[2]),
      predicate, r(instruction[3]), '? 1 : 0'
    );
  }
}

function unsupportedTranslation() {
  return function(instruction) {
    throw instruction[0] + ' is not supported.';
  }
}

function ignoredTranslation() {
  return function(instruction) {
    return '';
  }
}

translations.add = operatorTranslation('+');
translations.sub = operatorTranslation('-');
translations.mul = operatorTranslation('*');
translations.sll = functionImmediateTranslation('sll');
translations.srl = functionImmediateTranslation('srl');
translations.sra = functionImmediateTranslation('sra');
translations.and = functionTranslation('and');
translations.or = functionTranslation('or');
translations.xor = functionTranslation('xor');
translations.slt = conditionalTranslation('<');
translations.seq = conditionalTranslation('==');
translations.addi = immediateTranslation('+');

translations.lw = unsupportedTranslation();
translations.ldc = unsupportedTranslation();
translations.nop = ignoredTranslation();
translations.thread_finished = ignoredTranslation();

translations.mv = function(instruction) {
  return translations.addi(['addi', instruction[1], instruction[2], '0']);
}

translations.ldi = function(instruction) {
  return translations.addi(['addi', instruction[1], '0', instruction[2]]);
}

translations.sw = function(instruction) {
  return 'gl_FragColor=vec4(color(r[data]),1.);';
}

translations['?'] = function(instruction) {
  return [
    'if(r[mask]!=1){',
    translations[instruction[1]](instruction.slice(1)),
    '}'
  ].join('');
}

function transpile(asm, preamble, postamble) {

  var lines = asm.split('\n');

  /* remove comments */
  lines = lines.map(function(line) {
    return line.replace(/;.*/g, '');
  });

  /* remove dollar signs */
  lines = lines.map(function(line) {
    return line.replace(/\$/g, '');
  });

  /* replace commas with spaces */
  lines = lines.map(function(line) {
    return line.replace(/,/g, ' ');
  });

  /* collapse whitepace */
  lines = lines.map(function(line) {
    return line.replace(/[ \t\v]+/g, ' ');
  });

  /* clear space-only lines */
  lines = lines.map(function(line) {
    return line.replace(/^ $/, '');
  });

  /* remove empty lines */
  lines = lines.filter(identity);

  /* to lower case */
  lines = lines.map(function(line) {
    return line.toLowerCase();
  });

  /* parse */
  var glsl = lines.map(function(line) {
    var instruction = line.split(' ');
    console.log(instruction, instruction[0]);
    return translations[instruction[0]](instruction);
  });

  console.log(glsl);
  return preamble + glsl.join('\n') + postamble;
}

module = window.module || {};
module.exports = {
  transpile: transpile  
};

transpiler = {
  transpile: transpile
}

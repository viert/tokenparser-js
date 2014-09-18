var should = require('should');

var upTo = 1,
    skipTo = 2,
    skip = 3,
    skipAny = 4,
    skipMultiple = 5,
    searchString = 6,
    skipAll = 7;

function checkDefined(argument, argumentName) {
    if (typeof argument === "undefined")
        throw new Error("Argument " + argumentName + " must be defined");
}

var Tokenparser = function(options) {
    if (!(this instanceof Tokenparser)) {
        return new Tokenparser(options);
    }
    if (typeof options !== "object" || typeof options.strict === "undefined") {
        options = {
            strict: false
        };
    }
    this.options = options;
    this.rules = [];
    this.fields = [];
};

Tokenparser.prototype.upTo = function(symbol, fieldName) {
    symbol.should.be.String.with.lengthOf(1);
    fieldName.should.be.String;
    this.fields.should.not.containEql(fieldName);
    this.fields.push(fieldName);
    this.rules.push({
        action: upTo,
        symbol: symbol,
        fieldName: fieldName
    });
};

Tokenparser.prototype.skipTo = function(symbol) {
    symbol.should.be.String.with.lengthOf(1);
    this.rules.push({
        action: skipTo,
        symbol: symbol
    });
};

Tokenparser.prototype.skip = function(symbol) {
    symbol.should.be.String.with.lengthOf(1);
    this.rules.push({ action: skip, symbol: symbol });
};

Tokenparser.prototype.skipAll = function(symbol) {
    symbol.should.be.String.with.lengthOf(1);
    this.rules.push({ action: skipAll, symbol: symbol });
};

Tokenparser.prototype.skipMultiple = function(count) {
    count.should.be.Number.greaterThan(0);
    this.rules.push({ action: skipMultiple, count: count });
};

Tokenparser.prototype.skipAny = function() {
    this.rules.push({ action: skipAny });
}

Tokenparser.prototype.searchString = function(pattern) {
    pattern.should.be.String.and.not.empty;
    this.rules.push({ action: searchString, pattern: pattern });
}

Tokenparser.prototype.parseLine = function(line) {
    var result, rule, ruleIndex, linePointer;

    result = {};
    ruleIndex = 0;
    linePointer = 0;

    while (ruleIndex < this.rules.length) {
        rule = this.rules[ruleIndex];
        switch (rule.action) {
            case skip:
                if (linePointer >= line.length)
                    return { parsed: false, result: result };
                if (line[linePointer] !== rule.symbol)
                    return { parsed: false, result: result };
                linePointer++;
                break;
            case skipAny:
                if (linePointer >= line.length)
                    return { parsed: false, result: result };
                linePointer++;
                break;
            case skipMultiple:
                linePointer += rule.count;
                break;
            case skipTo:
                while(true) {
                    if (linePointer >= line.length)
                        return { parsed: false, result: result };
                    if (line[linePointer] === rule.symbol)
                        break;
                    linePointer++
                }
                break;
            case skipAll:
                while(line[linePointer] === rule.symbol) {
                    linePointer++;
                }
                break;
            case upTo:
                var firstSym = linePointer;
                while(true) {
                    if (linePointer >= line.length)
                        return { parsed: false, result: result };
                    if (line[linePointer] !== rule.symbol) {
                        linePointer++;
                    } else {
                        result[rule.fieldName] = line.slice(firstSym, linePointer);
                        break;
                    }
                }
                break;
            case searchString:
                var offset = line.slice(linePointer).indexOf(rule.pattern);
                if (offset < 0) {
                    return { parsed: false, result: result };
                } else {
                    linePointer += offset;
                }
                break;
        }
        ruleIndex++;
    }
    if (!this.options.strict) {
        return { parsed: true, result: result };
    } else {
        return { parsed: linePointer === line.length, result: result };
    }
};

module.exports = Tokenparser
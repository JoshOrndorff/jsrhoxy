// The crypto functions in this module are all quick and dirty
// They should not be considered secure. If jsRhoxy becomes
// serious enough that security is desired, these function should
// be replaced. I've tried to isolate the jank to this file.
module.exports = {
    qdHash: qdHash,
    mergeRandom: mergeRandom,
    splitRandom: splitRandom
};
/**
 * A quick and dirty hash function that will hash anything JSONy.
 * Based on java's string hash and this artcle
 * https://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 * @param data Any JSON-able data to be hashed
 * @return an integer hash
 */
function qdHash(data) {
    var strData = JSON.stringify(data);
    var hash = 0;
    if (strData.length == 0)
        return hash;
    for (var i = 0; i < strData.length; i++) {
        var char = strData.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}
/**
 * Poor man's  mergeable random state. Merges many random
 * states (integers) into one.
 *
 * @param initials The initial random states (integers) to merge
 * @return A new pseudo-random-ish state
 */
function mergeRandom(initials) {
    var merged = 0;
    for (var _i = 0, initials_1 = initials; _i < initials_1.length; _i++) {
        var initial = initials_1[_i];
        merged = qdHash(merged) & qdHash(initial);
    }
    return qdHash(merged);
}
/**
 * Given an initial random state (integer), calculates and
 * returns the desired number of new deterministic random states.
 *
 * @param initial The original random state
 * @param n The number of states to split into
 * @return An array of new random states
 */
function splitRandom(initial, n) {
    var tempRandom = initial;
    var results = [];
    for (var i = 0; i < n; i++) {
        tempRandom = qdHash(tempRandom);
        results.push(tempRandom);
    }
    return results;
}

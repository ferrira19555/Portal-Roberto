(function () {
  const SECRET = "VendasControl.Mobile.Liberacao.2026";
  const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

  function normalizeDeviceId(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function fnv1a(text) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i += 1) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
  }

  function encodeBase32(number, length) {
    let value = number >>> 0;
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out = ALPHABET[value & 31] + out;
      value >>>= 5;
    }
    return out;
  }

  function formatCode(raw) {
    return String(raw || "").replace(/(.{4})(?=.)/g, "$1-");
  }

  function generateCode(deviceId) {
    const cleanId = normalizeDeviceId(deviceId);
    if (cleanId.length < 8) return "";
    const part1 = fnv1a(`${SECRET}|A|${cleanId}`);
    const part2 = fnv1a(`${cleanId}|B|${SECRET}`);
    const check = fnv1a(`${part1}|${cleanId}|${part2}`) % ALPHABET.length;
    return formatCode(encodeBase32(part1, 6) + encodeBase32(part2, 5) + ALPHABET[check]);
  }

  function normalizeCode(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function validateCode(deviceId, code) {
    return normalizeCode(generateCode(deviceId)) === normalizeCode(code);
  }

  function makeDeviceId() {
    const bytes = new Uint8Array(8);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
    }
    let text = "";
    bytes.forEach((byte) => {
      text += ALPHABET[byte % ALPHABET.length];
    });
    return `VC-${text.slice(0, 4)}-${text.slice(4, 8)}`;
  }

  window.VendasLicenseCore = {
    generateCode,
    validateCode,
    normalizeCode,
    normalizeDeviceId,
    makeDeviceId,
  };
})();

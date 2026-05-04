import crypto from "crypto"

export function wsseHeader(username: string, password: string) {
  const nonce = crypto.randomBytes(16)
  const created = new Date().toISOString()
  // PasswordDigest = Base64(SHA1(nonce_bytes || created_utf8 || password_utf8))
  const digest = crypto
    .createHash("sha1")
    .update(Buffer.concat([nonce, Buffer.from(created, "utf8"), Buffer.from(password, "utf8")]))
    .digest("base64")

  return {
    "wsse:Security": {
      attributes: {
        "xmlns:wsse": "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd",
      },
      "wsse:UsernameToken": {
        "wsse:Username": username,
        "wsse:Password": {
          attributes: {
            Type: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordDigest",
          },
          $value: digest,
        },
        "wsse:Nonce": {
          attributes: {
            EncodingType: "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-soap-message-security-1.0#Base64Binary",
          },
          $value: nonce.toString("base64"),
        },
        "wsu:Created": {
          attributes: {
            "xmlns:wsu": "http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-utility-1.0.xsd",
          },
          $value: created,
        },
      },
    },
  }
}

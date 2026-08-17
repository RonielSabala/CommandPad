export { isEncryptedValue, isVaultSupported } from "./crypto";
export {
  adoptOpenVault,
  countEncryptedSecrets,
  createVault,
  decryptContent,
  decryptContentWithOpenVaults,
  decryptContentWithPassphrase,
  encryptContent,
  hasPlainSecrets,
  holdsSecrets,
  isVaultUnlocked,
  lockVault,
  recordFromCiphertext,
  resolveVaultStatus,
  unlockVault,
  type DecryptResult
} from "./vault";

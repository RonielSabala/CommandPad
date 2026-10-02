export { isEncryptedValue, isVaultSupported } from "./crypto";
export {
  adoptOpenVault,
  createVault,
  decryptContent,
  decryptContentWithOpenVaults,
  decryptContentWithPassphrase,
  encryptContent,
  hasEncryptedSecrets,
  hasPlainSecrets,
  holdsSecrets,
  isVaultUnlocked,
  lockVault,
  recordFromCiphertext,
  resolveVaultStatus,
  unlockVault,
  type DecryptResult
} from "./vault";

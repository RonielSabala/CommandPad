export { isEncryptedValue, isVaultSupported } from "./crypto";
export {
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
  resolveVaultStatus,
  unlockVault,
  type DecryptResult
} from "./vault";

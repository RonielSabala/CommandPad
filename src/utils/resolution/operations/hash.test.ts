import { RAW, checkResolution } from "@/test";

checkResolution("hash", {
  variables: {
    SERVICE: "api-gateway",
    ABC: "abc",
    UNICODE: "café 🚀",
    BYTES_55: "a".repeat(55),
    BYTES_56: "a".repeat(56),
    BYTES_64: "a".repeat(64),
  },
  cases: [
    [
      "{SERVICE|hash}",
      "fae39eb1cfc73239f30a0e31682c4b788f6d37a19a839bc74c1c38d79ef9c471",
    ],
    [
      "{SERVICE| hash }",
      "fae39eb1cfc73239f30a0e31682c4b788f6d37a19a839bc74c1c38d79ef9c471",
    ],
    [
      "{ABC|hash}",
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    ],
    // It hashes what the earlier operations produced
    [
      "{SERVICE|uppercase|hash}",
      "2e678c54130bc1e126262c1696f7f55453dd6e00ac9184b4f4bb02538329c410",
    ],
    ["{SERVICE|hash|slice(;12)}", "fae39eb1cfc7"],
    ["{SERVICE|hash|len}", "64"],
    // An unnamed reference hashes the empty string
    [
      "{|hash}",
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    ],
    // The value is read as UTF-8 bytes
    [
      "{UNICODE|hash}",
      "22b8c9581c75829df9ef018ebff80267c35f980ae1501f77d8a93ee193bede78",
    ],
    // Either side of the point where padding spills into a second block
    [
      "{BYTES_55|hash}",
      "9f4390f8d30c2dd92ec9f095b65e2b9ae9b0a925a5258e241c9f1e910f734318",
    ],
    [
      "{BYTES_56|hash}",
      "b35439a4ac6f0948b6d6f9e3c6af0f5f590ce20f1bde7090ef7970686ec6738a",
    ],
    [
      "{BYTES_64|hash}",
      "ffe054fe7ae0cb6dc65c3af9b61d5209f439851db43d0ba5997337df154668eb",
    ],
    ["{SERVICE|HASH}", RAW],
    ["{SERVICE|hash()}", RAW],
    ["{SERVICE|sha256}", RAW],
  ],
});

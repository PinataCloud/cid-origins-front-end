import { CID } from "multiformats/cid";
import * as raw from "multiformats/codecs/raw";
import { sha256 } from "multiformats/hashes/sha2";
import { useState } from "react";

export default function App() {
  const [cid, setCid] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCID = async (file) => {
    setIsGenerating(true);
    try {
      const fileBuffer = new Uint8Array(await file.arrayBuffer());
      const hash = await sha256.digest(fileBuffer);
      const cid = CID.create(1, raw.code, hash);
      const cidString = cid.toString();

      setCid(cidString);
    } catch (error) {
      console.error("Error generating CID:", error);
    }
    setIsGenerating(false);
  };

  return (
    <div>
      <h1>VERICID</h1>
      <input type="file" onChange={(e) => generateCID(e.target.files[0])} />
      {isGenerating ? <p>Generating CID...</p> : <p>{cid && `CID: ${cid}`}</p>}
    </div>
  );
}

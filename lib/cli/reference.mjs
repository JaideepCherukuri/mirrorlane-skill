import path from "node:path";

export async function writeReferencePackage({
  cleanZip,
  downloadCleanZip,
  fs,
  outputDirectory,
  reference,
  requestCleanZip,
}) {
  await fs.mkdir(outputDirectory, { recursive: true });

  const referencePath = path.join(outputDirectory, "mirrorlane-reference.json");
  const localArtifacts = {};

  if (downloadCleanZip) {
    const cleanZipPath = path.join(outputDirectory, cleanZip.localFileName);
    const downloaded = await requestCleanZip(cleanZipPath);
    localArtifacts.cleanZip = downloaded;
  }

  const localReference = {
    ...reference,
    localArtifacts,
    localPaths: {
      reference: referencePath,
    },
  };

  await fs.writeFile(referencePath, JSON.stringify(localReference, null, 2), "utf8");

  return {
    artifacts: localArtifacts,
    referencePath,
  };
}

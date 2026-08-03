import { createHash } from 'node:crypto';

const BLOCKED_URL_FINGERPRINTS = new Set([
  'f6da5d3dcac6ed5d4940789f24529c5138edc731ec1e60f86cca67f26524bbb8',
  '2d7cb9c23a0d937ae3689fce26a1a2b6a517e2c6f436b2865133a55491404d47',
  '374c3913a281d7b3c2b5ba95dbe38fb688d65fb923bda1592483ffac6c5641ff',
  'd7346e63c9689489f460fafb5dfec8fc266ba69172415eaf33f06a04486cca57',
  'b5ee00dab936d83d12325ca8b425355e73aa64f0ebb67dfc5a055b41173afafa',
  '343f8ad966091905236504f25de643569ee0c76e653b27164e6498e251f48b11',
  'b97e44f00863f0ab92ea18971bbe3f8516451f7eb9c63ecb8d42a5edbe9258ec',
  'd86f030cd99e106d09aa6b99563b9065d4352bf034ee1764ff2efb697cdffddd',
  '849cc9760fc9e195cc9fd5b668079836d774b11aeed5e11b1b4bfd1ee017d010',
  'e03493b5595e1f7f196359ea17f1c162adf93d756c45b38118fd44925ac4fe1b',
  'e06f89a6314ea9839415becd9b48d9f7c56ccc6e0ff71e8c748056554e670809',
  'a57518eeec825153dc81265d89e822b2a286f1f5bffecc24501c6bec39f68323',
  '86a1721d0857c9e6e24c2f6856dc45a8e723e96fe6ee27daa09c06ae24595da2',
  '6cea8ee37268ae9beb31cd96519a319b00778620400e08c7ea18efa85432439f',
  'de9716d33fd1299ee82b9229cfa276daaf7a56e97b1054ace734dd9c583dc64e',
  '3c7b5e93d3932dc344f13ff7e95c08d4fd1cd7fe5d712d0d0639cbfa9d18a555',
  '20410f81c2b2f67f19b92ac4c2e8d74d618e48960be383c5f60944f9e0f24b5d',
  'f0c86d7cfb8c688d537a3dca52e78b2b8c68757e8963c2b7be76a196f39fc1fd',
  'f8afeb8b153f67d8a87981f4076fab91aaa39f0536e1ef2699a429c401acf53f',
]);

const artifactPath = process.argv[2] ?? 'dist/index.html';
const artifact = Bun.file(artifactPath);

if (!(await artifact.exists())) {
  throw new Error(`Release artifact not found: ${artifactPath}`);
}

const contents = await artifact.text();
const urls = new Set(contents.match(/https?:\/\/[^\s"'<>\\]+/g) ?? []);
let blockedCount = 0;

for (const url of urls) {
  const fingerprint = createHash('sha256').update(url).digest('hex');
  if (BLOCKED_URL_FINGERPRINTS.has(fingerprint)) blockedCount += 1;
}

if (blockedCount > 0) {
  throw new Error(`Release artifact contains ${blockedCount} blocked relay URL fingerprint(s)`);
}

console.log(`Relay exposure check passed for ${artifactPath}`);

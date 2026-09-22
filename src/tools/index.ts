import type { ToolDefinition } from '../types/catalog';

/* ── Metadata: pure, React-free descriptions of each tool ─────────────────── */
import { metadata as networkDiagnosticsComposerMeta } from './network/network-diagnostics/network-diagnostics-composer/metadata';
import { metadata as dnsLookupMeta } from './network/dns-tools/dns-lookup/metadata';
import { metadata as dnsRecordReferenceMeta } from './network/dns-tools/dns-record-reference/metadata';
import { metadata as subnetCalculatorMeta } from './network/ip-subnet/subnet-calculator/metadata';
import { metadata as ipInspectorMeta } from './network/ip-subnet/ip-inspector/metadata';
import { metadata as portReferenceMeta } from './network/ports-services/port-reference/metadata';

import { metadata as securityHardeningComposerMeta } from './security/hardening/security-hardening-composer/metadata';
import { metadata as securityHeadersMeta } from './security/web-security/security-headers/metadata';
import { metadata as jwtDecoderMeta } from './security/authentication/jwt-decoder/metadata';
import { metadata as passwordStrengthMeta } from './security/authentication/password-strength/metadata';
import { metadata as hashGeneratorMeta } from './security/cryptography/hash-generator/metadata';

import { metadata as jsonFormatterMeta } from './developer/json-tools/json-formatter/metadata';
import { metadata as regexTesterMeta } from './developer/code-tools/regex-tester/metadata';
import { metadata as cronExplainerMeta } from './developer/code-tools/cron-explainer/metadata';
import { metadata as base64ToolMeta } from './developer/encoding-tools/base64-tool/metadata';
import { metadata as urlToolMeta } from './developer/encoding-tools/url-tool/metadata';

import { metadata as urlParserMeta } from './web/url-tools/url-parser/metadata';
import { metadata as httpHeaderParserMeta } from './web/http-tools/http-header-parser/metadata';

import { metadata as caseConverterMeta } from './text/text-tools/case-converter/metadata';
import { metadata as slugifyMeta } from './text/text-tools/slugify/metadata';
import { metadata as textStatsMeta } from './text/text-tools/text-stats/metadata';

import { metadata as csvJsonMeta } from './data/data-converters/csv-json/metadata';
import { metadata as backupComposerMeta } from './data/backup-restore/backup-composer/metadata';

import { metadata as numberBaseConverterMeta } from './encoding/base-conversion/number-base-converter/metadata';
import { metadata as byteConverterMeta } from './encoding/base-conversion/byte-converter/metadata';

import { metadata as sysinfoComposerMeta } from './system/system-metrics/sysinfo-composer/metadata';

import { metadata as uuidGeneratorMeta } from './utilities/generators/uuid-generator/metadata';
import { metadata as passwordGeneratorMeta } from './utilities/generators/password-generator/metadata';
import { metadata as loremIpsumMeta } from './utilities/generators/lorem-ipsum/metadata';
import { metadata as timestampConverterMeta } from './utilities/unit-converters/timestamp-converter/metadata';
import { metadata as colorConverterMeta } from './utilities/unit-converters/color-converter/metadata';

/* ── Implementations: the React components ────────────────────────────────── */
import { ShellComposerTool } from './shared/ShellComposerTool';
import { DnsLookupTool } from './network/dns-tools/dns-lookup/DnsLookupTool';
import { DnsRecordReferenceTool } from './network/dns-tools/dns-record-reference/DnsRecordReferenceTool';
import { SubnetCalculatorTool } from './network/ip-subnet/subnet-calculator/SubnetCalculatorTool';
import { IpInspectorTool } from './network/ip-subnet/ip-inspector/IpInspectorTool';
import { PortReferenceTool } from './network/ports-services/port-reference/PortReferenceTool';

import { SecurityHeadersTool } from './security/web-security/security-headers/SecurityHeadersTool';
import { JwtDecoderTool } from './security/authentication/jwt-decoder/JwtDecoderTool';
import { PasswordStrengthTool } from './security/authentication/password-strength/PasswordStrengthTool';
import { HashGeneratorTool } from './security/cryptography/hash-generator/HashGeneratorTool';

import { JsonFormatterTool } from './developer/json-tools/json-formatter/JsonFormatterTool';
import { RegexTesterTool } from './developer/code-tools/regex-tester/RegexTesterTool';
import { CronExplainerTool } from './developer/code-tools/cron-explainer/CronExplainerTool';
import { Base64Tool } from './developer/encoding-tools/base64-tool/Base64Tool';
import { UrlTool } from './developer/encoding-tools/url-tool/UrlTool';

import { UrlParserTool } from './web/url-tools/url-parser/UrlParserTool';
import { HttpHeaderParserTool } from './web/http-tools/http-header-parser/HttpHeaderParserTool';

import { CaseConverterTool } from './text/text-tools/case-converter/CaseConverterTool';
import { SlugifyTool } from './text/text-tools/slugify/SlugifyTool';
import { TextStatsTool } from './text/text-tools/text-stats/TextStatsTool';

import { CsvJsonTool } from './data/data-converters/csv-json/CsvJsonTool';

import { NumberBaseConverterTool } from './encoding/base-conversion/number-base-converter/NumberBaseConverterTool';
import { ByteConverterTool } from './encoding/base-conversion/byte-converter/ByteConverterTool';

import { UuidGeneratorTool } from './utilities/generators/uuid-generator/UuidGeneratorTool';
import { PasswordGeneratorTool } from './utilities/generators/password-generator/PasswordGeneratorTool';
import { LoremIpsumTool } from './utilities/generators/lorem-ipsum/LoremIpsumTool';
import { TimestampConverterTool } from './utilities/unit-converters/timestamp-converter/TimestampConverterTool';
import { ColorConverterTool } from './utilities/unit-converters/color-converter/ColorConverterTool';

/**
 * ────────────────────────────────────────────────────────────────────────────
 *  Tool registry
 * ────────────────────────────────────────────────────────────────────────────
 *  The one place where metadata meets implementation. Adding a tool is:
 *
 *    1. drop a `metadata.ts` + component into `src/tools/<domain>/<template>/…`
 *    2. add the two imports and one row below
 *
 *  No page, navigation, search or routing file needs to change — the catalog
 *  derives everything from this array.
 */
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  /* Network */
  { metadata: networkDiagnosticsComposerMeta, Component: ShellComposerTool },
  { metadata: dnsLookupMeta, Component: DnsLookupTool },
  { metadata: dnsRecordReferenceMeta, Component: DnsRecordReferenceTool },
  { metadata: subnetCalculatorMeta, Component: SubnetCalculatorTool },
  { metadata: ipInspectorMeta, Component: IpInspectorTool },
  { metadata: portReferenceMeta, Component: PortReferenceTool },

  /* Security */
  { metadata: securityHardeningComposerMeta, Component: ShellComposerTool },
  { metadata: securityHeadersMeta, Component: SecurityHeadersTool },
  { metadata: jwtDecoderMeta, Component: JwtDecoderTool },
  { metadata: passwordStrengthMeta, Component: PasswordStrengthTool },
  { metadata: hashGeneratorMeta, Component: HashGeneratorTool },

  /* Developer */
  { metadata: jsonFormatterMeta, Component: JsonFormatterTool },
  { metadata: regexTesterMeta, Component: RegexTesterTool },
  { metadata: cronExplainerMeta, Component: CronExplainerTool },
  { metadata: base64ToolMeta, Component: Base64Tool },
  { metadata: urlToolMeta, Component: UrlTool },

  /* Web */
  { metadata: urlParserMeta, Component: UrlParserTool },
  { metadata: httpHeaderParserMeta, Component: HttpHeaderParserTool },

  /* Text */
  { metadata: caseConverterMeta, Component: CaseConverterTool },
  { metadata: slugifyMeta, Component: SlugifyTool },
  { metadata: textStatsMeta, Component: TextStatsTool },

  /* Data */
  { metadata: csvJsonMeta, Component: CsvJsonTool },
  { metadata: backupComposerMeta, Component: ShellComposerTool },

  /* Encoding */
  { metadata: numberBaseConverterMeta, Component: NumberBaseConverterTool },
  { metadata: byteConverterMeta, Component: ByteConverterTool },

  /* System */
  { metadata: sysinfoComposerMeta, Component: ShellComposerTool },

  /* Utilities */
  { metadata: uuidGeneratorMeta, Component: UuidGeneratorTool },
  { metadata: passwordGeneratorMeta, Component: PasswordGeneratorTool },
  { metadata: loremIpsumMeta, Component: LoremIpsumTool },
  { metadata: timestampConverterMeta, Component: TimestampConverterTool },
  { metadata: colorConverterMeta, Component: ColorConverterTool },
];

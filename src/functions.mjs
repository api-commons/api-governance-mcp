// The custom Spectral functions the best-of-breed ruleset references, keyed by the
// namespaced name a rule uses in `then.function` (e.g. "trimble:valid-url-checker").
// Built-in Spectral functions (truthy, pattern, schema, …) are spread in first so a
// rule can name either. Mirrors the validator's compiled function map.
import * as builtins from '@stoplight/spectral-functions';

import baloiseAssertHttpCodesForOperation from './functions/baloise/assert-http-codes-for-operation.js';
import baloiseValidateTracing from './functions/baloise/validate-tracing.js';
import digitaloceanEnsurePropertiesExample from './functions/digitalocean/ensurePropertiesExample.js';
import digitaloceanEnsureAllArraysHaveItemTypes from './functions/digitalocean/ensureAllArraysHaveItemTypes.js';
import digitaloceanEnsureSnakeCaseWithDigits from './functions/digitalocean/ensureSnakeCaseWithDigits.js';
import digitaloceanEnsureSchemaHasType from './functions/digitalocean/ensureSchemaHasType.js';
import microcksOasVerifyMocks from './functions/microcks/oas-verify-mocks.js';
import microcksAasVerifyMocks from './functions/microcks/aas-verify-mocks.js';
import trimbleValidUrlChecker from './functions/trimble/valid-url-checker.js';
import trimbleValidVersionChecker from './functions/trimble/valid-version-checker.js';
import trimbleNoHttpVerbsInPath from './functions/trimble/no-http-verbs-in-path.js';
import trimbleCheckIfApplicationOrJsonInPutAndPostResponse from './functions/trimble/check-if-application-or-json-in-put-and-post-response.js';
import trimbleCheckIfResponseBodyJsonInGetResponse from './functions/trimble/check-if-response-body-json-in-get-response.js';
import trimbleValidHttpResponse from './functions/trimble/valid-http-response.js';
import trimbleCheckForQueryParameterInEveryPath from './functions/trimble/check-for-query-parameter-in-every-path.js';
import trimbleDoesSpecContainsValidHttpVerbs from './functions/trimble/does-spec-contains-valid-http-verbs.js';
import trimbleIsValidSpec from './functions/trimble/is-valid-spec.js';
import trimbleOperationSummaryDescription from './functions/trimble/operation-summary-description.js';
import trimbleOperationPost201202StatusCode from './functions/trimble/operation-post-201-202-status-code.js';
import trimbleCheckContentTypeFor206GetResponseCode from './functions/trimble/check-content-type-for-206-get-response-code.js';
import trimbleCheckStandardForErrorPayload from './functions/trimble/check-standard-for-error-payload.js';
import trimbleCheckDescriptionForAllErrorResponses from './functions/trimble/check-description-for-all-error-responses.js';
import trimbleCheckDescriptionForAllSuccessResponses from './functions/trimble/check-description-for-all-success-responses.js';
import trimbleCheckForContentTypeInPutAndPostResponses from './functions/trimble/check-for-content-type-in-put-and-post-responses.js';
import trimbleCheckForPathParameter from './functions/trimble/check-for-path-parameter.js';
import trimbleCheckForResponseInEveryRequest from './functions/trimble/check-for-response-in-every-request.js';
import trimbleDeleteMustNotReturnBody from './functions/trimble/delete-must-not-return-body.js';
import trimbleInvalidSymbolInPath from './functions/trimble/invalid-symbol-in-path.js';

export const FN_MAP = {
  ...builtins,
  'baloise:assert-http-codes-for-operation': baloiseAssertHttpCodesForOperation,
  'baloise:validate-tracing': baloiseValidateTracing,
  'digitalocean:ensurePropertiesExample': digitaloceanEnsurePropertiesExample,
  'digitalocean:ensureAllArraysHaveItemTypes': digitaloceanEnsureAllArraysHaveItemTypes,
  'digitalocean:ensureSnakeCaseWithDigits': digitaloceanEnsureSnakeCaseWithDigits,
  'digitalocean:ensureSchemaHasType': digitaloceanEnsureSchemaHasType,
  'microcks:oas-verify-mocks': microcksOasVerifyMocks,
  'microcks:aas-verify-mocks': microcksAasVerifyMocks,
  'trimble:valid-url-checker': trimbleValidUrlChecker,
  'trimble:valid-version-checker': trimbleValidVersionChecker,
  'trimble:no-http-verbs-in-path': trimbleNoHttpVerbsInPath,
  'trimble:check-if-application-or-json-in-put-and-post-response': trimbleCheckIfApplicationOrJsonInPutAndPostResponse,
  'trimble:check-if-response-body-json-in-get-response': trimbleCheckIfResponseBodyJsonInGetResponse,
  'trimble:valid-http-response': trimbleValidHttpResponse,
  'trimble:check-for-query-parameter-in-every-path': trimbleCheckForQueryParameterInEveryPath,
  'trimble:does-spec-contains-valid-http-verbs': trimbleDoesSpecContainsValidHttpVerbs,
  'trimble:is-valid-spec': trimbleIsValidSpec,
  'trimble:operation-summary-description': trimbleOperationSummaryDescription,
  'trimble:operation-post-201-202-status-code': trimbleOperationPost201202StatusCode,
  'trimble:check-content-type-for-206-get-response-code': trimbleCheckContentTypeFor206GetResponseCode,
  'trimble:check-standard-for-error-payload': trimbleCheckStandardForErrorPayload,
  'trimble:check-description-for-all-error-responses': trimbleCheckDescriptionForAllErrorResponses,
  'trimble:check-description-for-all-success-responses': trimbleCheckDescriptionForAllSuccessResponses,
  'trimble:check-for-content-type-in-put-and-post-responses': trimbleCheckForContentTypeInPutAndPostResponses,
  'trimble:check-for-path-parameter': trimbleCheckForPathParameter,
  'trimble:check-for-response-in-every-request': trimbleCheckForResponseInEveryRequest,
  'trimble:delete-must-not-return-body': trimbleDeleteMustNotReturnBody,
  'trimble:invalid-symbol-in-path': trimbleInvalidSymbolInPath,
};

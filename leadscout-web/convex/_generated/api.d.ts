/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as helpers from "../helpers.js";
import type * as internal_payoutHelpers from "../internal/payoutHelpers.js";
import type * as lib_calculateCommission from "../lib/calculateCommission.js";
import type * as lib_calculateLeadPrice from "../lib/calculateLeadPrice.js";
import type * as lib_calculateQualityScore from "../lib/calculateQualityScore.js";
import type * as lib_calculateScoutQuality from "../lib/calculateScoutQuality.js";
import type * as lib_constants from "../lib/constants.js";
import type * as lib_validateLeadData from "../lib/validateLeadData.js";
import type * as seed from "../seed.js";
import type * as types from "../types.js";
import type * as validators from "../validators.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  helpers: typeof helpers;
  "internal/payoutHelpers": typeof internal_payoutHelpers;
  "lib/calculateCommission": typeof lib_calculateCommission;
  "lib/calculateLeadPrice": typeof lib_calculateLeadPrice;
  "lib/calculateQualityScore": typeof lib_calculateQualityScore;
  "lib/calculateScoutQuality": typeof lib_calculateScoutQuality;
  "lib/constants": typeof lib_constants;
  "lib/validateLeadData": typeof lib_validateLeadData;
  seed: typeof seed;
  types: typeof types;
  validators: typeof validators;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};

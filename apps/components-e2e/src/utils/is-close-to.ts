/**
 * @license
 * Copyright 2019 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
export function isCloseTo(
  value: number,
  expectation: number,
  threshold: number = 3,
): boolean {
  const rounded = Math.round(value);
  if (rounded === expectation) {
    return true;
  }

  for (let i = 1; i <= threshold; i++) {
    if (rounded + i === expectation || rounded - i === expectation) {
      return true;
    }
  }
  return false;
}
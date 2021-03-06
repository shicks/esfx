/*!
   Copyright 2019 Ron Buckton

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

import { isObject, isFunction, isDefined } from "@esfx/internal-guards";

export interface Lockable {
    [Lockable.lock](ms?: number): boolean;
    [Lockable.tryLock]?(): boolean;
    [Lockable.unlock](): boolean;
}

export namespace Lockable {
    export const lock = Symbol.for("@esfx/thread-lockable:Lockable.lock");
    export const tryLock = Symbol.for("@esfx/thread-lockable:Lockable.tryLock");
    export const unlock = Symbol.for("@esfx/thread-lockable:Lockable.unlock");

    export const name = "Lockable";

    export function hasInstance(value: unknown): value is Lockable {
        return isObject(value)
            && Lockable.lock in value
            && Lockable.unlock in value
            && (!(Lockable.tryLock in value) || !isDefined(Lockable.tryLock) || isFunction(Lockable.tryLock));
    }
}

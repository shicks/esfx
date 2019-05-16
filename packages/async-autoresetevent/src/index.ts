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

   THIRD PARTY LICENSE NOTICE:

   AutoResetEvent is derived from the implementation of AutoResetEvent in
   Promise Extensions for Javascript: https://github.com/rbuckton/prex

   Promise Extensions is licensed under the Apache 2.0 License:

   Promise Extensions for JavaScript
   Copyright (c) Microsoft Corporation

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

import { LinkedList } from "@esfx/collections-linkedlist";
import { Cancelable, CancelError } from "@esfx/cancelable";
import { CancelToken } from "@esfx/async-canceltoken";
import { isMissing, isBoolean } from "@esfx/internal-guards";

/**
 * Asynchronously notifies one or more waiting Promises that an event has occurred.
 */
export class AutoResetEvent {
    private _signaled: boolean;
    private _waiters = new LinkedList<() => void>();

    /**
     * Initializes a new instance of the AutoResetEvent class.
     *
     * @param initialState A value indicating whether to set the initial state to signaled.
     */
    constructor(initialState?: boolean) {
        if (isMissing(initialState)) initialState = false;
        if (!isBoolean(initialState)) throw new TypeError("Boolean expected: initialState.");

        this._signaled = initialState;
    }

    /**
     * Sets the state of the event to signaled, resolving one or more waiting Promises.
     * The event is then automatically reset.
     */
    set(): void {
        if (!this._signaled) {
            this._signaled = true;
            if (this._waiters.size > 0) {
                for (const waiter of this._waiters.drain()) {
                    if (waiter) waiter();
                }

                this._signaled = false;
            }
        }
    }

    /**
     * Sets the state of the event to nonsignaled, causing asynchronous operations to pause.
     */
    reset(): void {
        this._signaled = false;
    }

    /**
     * Asynchronously waits for the event to become signaled.
     *
     * @param cancelable A Cancelable used to cancel the request.
     */
    wait(cancelable?: Cancelable): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const token = CancelToken.from(cancelable);
            token.throwIfSignaled();

            if (this._signaled) {
                resolve();
                this._signaled = false;
                return;
            }

            const node = this._waiters.push(() => {
                subscription.unsubscribe();
                resolve();
            });

            const subscription = token.subscribe(() => {
                if (node.detachSelf()) {
                    reject(new CancelError());
                }
            });
        });
    }
}
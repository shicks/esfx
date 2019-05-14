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

   AsyncStack is derived from the implementation of Stack in
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
import { isMissing, isIterable } from "@esfx/internal-guards";

/**
 * An asynchronous Stack.
 */
export class AsyncStack<T> {
    private _available: Array<Promise<T>> | undefined = undefined;
    private _pending: LinkedList<(value: T | PromiseLike<T>) => void> | undefined = undefined;

    /**
     * Initializes a new instance of the AsyncStack class.
     *
     * @param iterable An optional iterable of values or promises.
     */
    constructor(iterable?: Iterable<T | PromiseLike<T>>) {
        if (!isMissing(iterable) && !isIterable(iterable)) throw new TypeError("Object not iterable: iterable.");
        if (!isMissing(iterable)) {
            this._available = [];
            for (const value of iterable) {
                this._available.push(Promise.resolve(value));
            }
        }
    }

    /**
     * Gets the number of entries in the stack.
     * When positive, indicates the number of entries available to get.
     * When negative, indicates the number of requests waiting to be fulfilled.
     */
    public get size() {
        if (this._available && this._available.length > 0) {
            return this._available.length;
        }
        if (this._pending && this._pending.size > 0) {
            return -this._pending.size;
        }
        return 0;
    }


    /**
     * Adds a value to the top of the stack. If the stack is empty but has a pending
     * pop request, the value will be popped and the request fulfilled.
     *
     * @param value A value or promise to add to the stack.
     */
    public push(value: T | PromiseLike<T>): void {
        if (this._pending !== undefined) {
            const resolve = this._pending.shift();
            if (resolve !== undefined) {
                resolve(value);
                return;
            }
        }

        if (this._available === undefined) {
            this._available = [];
        }

        this._available.push(Promise.resolve(value));
    }

    /**
     * Removes and returns a Promise for the top value of the stack. If the stack is empty,
     * returns a Promise for the next value to be pushed on to the stack.
     *
     * @param cancelable A Cancelable used to cancel the request.
     */
    public pop(cancelable?: Cancelable): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const token = CancelToken.from(cancelable);
            token.throwIfSignaled();

            if (this._available !== undefined) {
                const promise = this._available.pop();
                if (promise !== undefined) {
                    resolve(promise);
                    return;
                }
            }

            if (this._pending === undefined) {
                this._pending = new LinkedList();
            }

            const node = this._pending.push(value => {
                subscription.unsubscribe();
                resolve(value);
            });

            const subscription = token.subscribe(() => {
                if (node.detachSelf()) {
                    reject(new CancelError());
                }
            });
        });
    }
}
'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        events: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            if (!this.events.hasOwnProperty(event)) {
                this.events[event] = [];
            }
            this.events[event].push({ context: context, handler: handler.bind(context) });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            let unsubEvents = [];
            for (let addedEvent in this.events) {
                if (!this.events.hasOwnProperty(addedEvent)) {
                    continue;
                }
                let isEvUnsub = unsubEvents.some((unsEv) => unsEv === addedEvent);
                if (!isEvUnsub && addedEvent.indexOf(event + '.') !== -1) {
                    unsubEvents.push(deleteSubscribe(this, addedEvent, context));
                }
                if (!isEvUnsub && addedEvent === event) {
                    unsubEvents.push(deleteSubscribe(this, addedEvent, context));
                }
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let events = splitToNamespace(event);
            events.forEach(function (item) {
                if (this.events.hasOwnProperty(item) && this.events[item].length !== 0) {
                    this.events[item].forEach(function (obj) {
                        if (obj.hasOwnProperty('frequency')) {
                            let count = obj.numsOfEvents % obj.frequency;
                            if (count === 0) {
                                obj.handler();
                            }
                            obj.numsOfEvents++;
                        } else if (obj.hasOwnProperty('times')) {
                            if (obj.numsOfEvents > (obj.times - 1)) {
                                deleteSubscribe(this, item, obj.context);
                            } else {
                                obj.handler();
                            }
                            obj.numsOfEvents++;
                        } else {
                            obj.handler();
                        }
                    }, this);
                }
            }, this);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (!this.events.hasOwnProperty(event)) {
                this.events[event] = [];
            }
            let obj = { context: context,
                handler: handler.bind(context) };
            if (times > 0) {
                obj.times = times;
                obj.numsOfEvents = 0;
            }
            this.events[event].push(obj);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (!this.events.hasOwnProperty(event)) {
                this.events[event] = [];
            }
            let obj = { context: context,
                handler: handler.bind(context) };
            if (frequency > 0) {
                obj.frequency = frequency;
                obj.numsOfEvents = 0;
            }
            this.events[event].push(obj);

            return this;
        }
    };
}

function deleteSubscribe(localThis, event, context) {
    if (localThis.events.hasOwnProperty(event)) {
        let index = localThis.events[event].findIndex((item) => item.context === context);
        if (index !== -1) {
            return localThis.events[event].splice(index, 1);
        }
    }

    return undefined;
}

function splitToNamespace(event) {
    let events = event.split('.');

    return events.reduce(function (prev, curr, index) {
        if (index === 0) {
            prev.push(curr);
        } else {
            prev.push(prev[index - 1] + '.' + curr);
        }

        return prev;
    }, [])
        .reverse();
}

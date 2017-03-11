/* @flow */
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import debounce from 'lodash/debounce';
import {loadState, storeState} from './storage';
import reducer from './reducer';
import type {State} from './reducer';
import type {User} from './models';

const getInitialState = ({conversations, messages} = {}, user) => {
    const state = {
        conversations: {
            ...conversations,
            all: {
                name: 'All',
                fullName: 'All',
                id: 'all',
                avatar: require('./assets/ic_group.svg'),
            },
            [user.id]: user,
        },
        currentUser: user,
        messages,
    };

    return state;
};

const configStore = (user: User, chatClient: Object) => {
    const persistedState = loadState(user.id);

    const store = createStore(
        reducer,
        getInitialState(persistedState, user),
        applyMiddleware(thunk.withExtraArgument({chatClient})),
    );

    store.subscribe(debounce(() => {
        const {messages, conversations, currentUser}: State = store.getState();
        storeState({messages, conversations}, currentUser.id);
    }), 1000);

    return store;
};

export default configStore;

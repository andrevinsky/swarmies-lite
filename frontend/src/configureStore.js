import { applyMiddleware, compose, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import monitorReducersEnhancer from './model/enhancers/monitorReducer'


import rootReducer from './model';

export default function configureStore(preloadedState) {
  const middlewares = [ /*loggerMiddleware,*/ thunkMiddleware ];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [ middlewareEnhancer, monitorReducersEnhancer ];
  const composedEnhancers = ((process.env.NODE_ENV === 'development') ? composeWithDevTools : compose)(...enhancers);

  const store = createStore(rootReducer, preloadedState, composedEnhancers);

  if (process.env.NODE_ENV !== 'production' && module.hot) {
    module.hot.accept('./model', () => store.replaceReducer(rootReducer))
  }

  return store;
}

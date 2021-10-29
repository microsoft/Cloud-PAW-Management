// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { Provider } from 'react-redux';
import { PawLanding } from './components/PawLanding';
import { configureStore } from './store/configureStore';

const store = configureStore();

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <PawLanding />
      </div>
    </Provider>
  );
}

export default App;

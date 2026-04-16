import React from 'react';
import ReactDOM from 'react-dom';

import singleSpaReact from 'single-spa-react';
import Root from './root.component'; // Or wherever your main component is

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    return <div>This renders when a crash happens</div>;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
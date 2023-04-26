import * as React from 'react';
import './style.css';
import { RecycleView } from './RecycleView';

export default function App() {
  return (
    <div>
      <h1>Hello StackBlitz!</h1>
      <p>Start editing to see some magic happen :)</p>

      <RecycleView
        gap={12}
        items={[]}
        minHeight={100}
        minWidth={100}
        renderItem={(item) => (
          <div>
            <div>{item.name}</div>
            <div>{item.descr}</div>
          </div>
        )}
        loadMore={async () => [
          { name: 'woof', descr: 'woof dog' },
          { name: 'meow', descr: 'meow cat' },
          { name: 'baaah', descr: 'baah sheep' },
        ]}
      />
    </div>
  );
}

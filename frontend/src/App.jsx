// frontend/src/App.jsx
import React from 'react';
import AppLayout from './components/AppLayout';
import Card from './components/Card'; // Example usage of Card
import Button from './components/Button'; // Example usage of Button

function App() {
  return (
    <AppLayout>
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Welcome to The Solblist!
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          This is a basic application structure using Tailwind CSS.
        </p>

        <Card title="Example Card" className="max-w-md mx-auto mb-8 text-left dark:bg-gray-800 dark:text-gray-200">
          <p className="mb-4">
            This is an instance of the reusable <code>Card</code> component.
            You can put any content you like in here.
          </p>
          <Button variant="primary" onClick={() => alert('Button clicked!')}>
            Click Me!
          </Button>
        </Card>

        <div className="space-x-4">
          <Button variant="secondary">Secondary Action</Button>
          <Button variant="danger">Delete Something</Button>
          <Button variant="outline">Outline Button</Button>
        </div>

      </div>
    </AppLayout>
  );
}

export default App;

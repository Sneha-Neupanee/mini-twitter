import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

export default function AppLayout({ children, hideRightSidebar = false }) {
  return (
    <div className="min-h-screen flex bg-surface-muted">
      <Sidebar />
      <div className="ml-64 flex-1 flex justify-center">
        <div className={`flex w-full max-w-5xl ${hideRightSidebar ? 'justify-center' : ''}`}>
          <main className={`flex-1 min-h-screen border-x border-gray-100 bg-white ${hideRightSidebar ? 'max-w-2xl' : ''}`}>
            {children}
          </main>
          {!hideRightSidebar && <RightSidebar />}
        </div>
      </div>
    </div>
  );
}

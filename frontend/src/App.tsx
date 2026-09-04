import {AuthProvider} from './context/AuthContext';
import {Toaster} from 'react-hot-toast';
import {LoadingProvider} from './context/LoadingContext';
import {AppRoutes} from './routes/AppRoutes';
import {AxiosProvider} from './axios';

function App() {
    return (
        <LoadingProvider>
            <AxiosProvider>
                <AuthProvider>
                    <Toaster/>
                    <AppRoutes/>
                </AuthProvider>
            </AxiosProvider>
        </LoadingProvider>
    );
}

export default App;
import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Alert,
  Space,
  Divider 
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined, 
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const API_BASE_URL = 'http://localhost:8000';

  const onLoginSuccess = (token, user) => {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_data', JSON.stringify(user));
    setIsAuthenticated(true);
    setCurrentUser(user);
    onNavigate('bdteque');
  };

  // Check if admin setup is required and if user is already authenticated
  useEffect(() => {
    checkSetupStatus();
    checkAuthStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/check-setup`);
      const data = await response.json();
      setSetupRequired(data.setup_required);
      if (data.setup_required) {
        setIsLogin(false); // Switch to signup mode if setup is required
      }
    } catch (error) {
      console.error('Error checking setup status:', error);
      message.error('Erreur de connexion au serveur');
    } finally {
      setCheckingSetup(false);
    }
  };

  const checkAuthStatus = () => {
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
      }
    }
  };

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        setCurrentUser(data.user);
        setIsAuthenticated(true);
        message.success('Connexion réussie !');
        
        // Call the success callback if provided
        if (onLoginSuccess) {
          onLoginSuccess(data.access_token, data.user);
        }
      } else {
        message.error(data.detail || 'Erreur de connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error('Erreur de connexion au serveur');
    }
  };

  const handleSignup = async (values) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/create-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        message.success('Compte administrateur créé avec succès !');
        setSetupRequired(false);
        setIsLogin(true);
      } else {
        message.error(data.detail || 'Erreur lors de la création du compte');
      }
    } catch (error) {
      console.error('Signup error:', error);
      message.error('Erreur de connexion au serveur');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    
    try {
      if (isLogin) {
        await handleLogin(values);
      } else {
        await handleSignup(values);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    setCurrentUser(null);
    setIsAuthenticated(false);
    message.success('Déconnexion réussie');
  };

  // Show loading state while checking setup
  if (checkingSetup) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Text>Vérification de la configuration...</Text>
        </Card>
      </div>
    );
  }

  // Show authenticated user dashboard
  if (isAuthenticated && currentUser) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <div style={{ width: '100%', maxWidth: 500 }}>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />}
              onClick={() => onNavigate && onNavigate('bdteque')}
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white'
              }}
            >
              Retour à la BDtèque
            </Button>
          </div>
          
          <Card 
            style={{ 
              width: '100%',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={2} style={{ color: '#52c41a', marginBottom: '8px' }}>
                Connecté avec succès
              </Title>
              <Text type="secondary">
                Panneau d'administration
              </Text>
            </div>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
                <Title level={4} style={{ margin: '0 0 8px 0' }}>Informations du compte</Title>
                <Text><strong>Nom d'utilisateur:</strong> {currentUser.username}</Text><br/>
                <Text><strong>Email:</strong> {currentUser.email}</Text><br/>
                <Text><strong>Statut:</strong> {currentUser.is_admin ? 'Administrateur' : 'Utilisateur'}</Text><br/>
                <Text><strong>Compte créé:</strong> {new Date(currentUser.created_at).toLocaleDateString('fr-FR')}</Text>
              </div>

              <Alert
                message="Accès administrateur"
                description="Vous avez accès à toutes les fonctionnalités d'administration de la BDthèque. Vous pouvez gérer les BD, les membres et les locations."
                type="success"
                showIcon
              />

              <Button 
                type="primary" 
                danger
                block
                onClick={handleLogout}
                style={{
                  height: '45px',
                  fontSize: '16px'
                }}
              >
                Se déconnecter
              </Button>
            </Space>
          </Card>
        </div>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '80vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => onNavigate && onNavigate('bdteque')}
            style={{ 
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white'
            }}
          >
            Retour à la BDtèque
          </Button>
        </div>
        
        <Card 
          style={{ 
            width: '100%',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}
        >
          {setupRequired && (
            <Alert
              message="Configuration initiale requise"
              description="Aucun compte administrateur n'existe. Créez le premier compte administrateur pour accéder au système."
              type="info"
              showIcon
              style={{ marginBottom: '20px' }}
            />
          )}

          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
              {setupRequired ? 'Configuration Admin' : (isLogin ? 'Connexion' : 'Inscription')}
            </Title>
            <Text type="secondary">
              {setupRequired ? 'Créez le compte administrateur' : (isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte')}
            </Text>
          </div>

          <Form
            name="auth"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            {(!isLogin || setupRequired) && (
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez entrer votre email !' },
                  { type: 'email', message: 'Email invalide !' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Email" 
                />
              </Form.Item>
            )}

            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Veuillez entrer votre nom d\'utilisateur !' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Nom d'utilisateur" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Veuillez entrer votre mot de passe !' }]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Mot de passe" 
              />
            </Form.Item>

            {(!isLogin || setupRequired) && (
              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Confirmez votre mot de passe !' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Les mots de passe ne correspondent pas !'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="Confirmer le mot de passe" 
                />
              </Form.Item>
            )}

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                icon={setupRequired ? <UserAddOutlined /> : (isLogin ? <LoginOutlined /> : <UserAddOutlined />)}
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: '45px',
                  fontSize: '16px'
                }}
              >
                {setupRequired ? 'Créer Admin' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
              </Button>
            </Form.Item>
          </Form>

          {!setupRequired && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <Text type="secondary">
                {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
                <Button 
                  type="link" 
                  onClick={() => setIsLogin(!isLogin)}
                  style={{ padding: 0, fontSize: '14px' }}
                >
                  {isLogin ? 'S\'inscrire' : 'Se connecter'}
                </Button>
              </Text>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;

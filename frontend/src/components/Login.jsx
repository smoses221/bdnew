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

const Login = ({ onNavigate, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [setupRequired, setSetupRequired] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);

  const API_BASE_URL = 'http://localhost:8000';

  // Check if admin setup is required
  useEffect(() => {
    checkSetupStatus();
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

  const handleLogin = async (values) => {
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
        // Call the success callback to update parent state
        if (onLoginSuccess) {
          onLoginSuccess(data.access_token, data.user);
        }
        
        message.success('Connexion réussie !');
        
        // Navigate to main page after successful login
        if (onNavigate) {
          onNavigate('bdteque');
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

  // Show loading state while checking setup
  if (checkingSetup) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 64px)', // Account for navigation height
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px'
      }}>
        <Card style={{ textAlign: 'center', padding: '40px' }}>
          <Text>Vérification de la configuration...</Text>
        </Card>
      </div>
    );
  }

  // Show login/signup form
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - 64px)', // Account for navigation height
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
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

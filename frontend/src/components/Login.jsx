import React, { useState } from 'react';
import { Card, Input, Button, Form, Typography, Space, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Login = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const onFinish = async (values) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      if (isLogin) {
        message.success('Connexion réussie !');
      } else {
        message.success('Compte créé avec succès !');
      }
      setLoading(false);
    }, 1000);
  };

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
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            {isLogin ? 'Connexion' : 'Inscription'}
          </Title>
          <Text type="secondary">
            {isLogin ? 'Connectez-vous à votre compte' : 'Créez votre compte'}
          </Text>
        </div>

        <Form
          name="auth"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          {!isLogin && (
            <Form.Item
              name="name"
              rules={[{ required: true, message: 'Veuillez entrer votre nom !' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Nom complet" 
              />
            </Form.Item>
          )}

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

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Veuillez entrer votre mot de passe !' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Mot de passe" 
            />
          </Form.Item>

          {!isLogin && (
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
              block
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                height: '45px',
                fontSize: '16px'
              }}
            >
              {isLogin ? 'Se connecter' : 'S\'inscrire'}
            </Button>
          </Form.Item>
        </Form>

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
        </div>        </Card>
      </div>
    </div>
  );
};

export default Login;

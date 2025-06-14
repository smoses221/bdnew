import React from 'react';
import { Typography, Card, Space, Divider, Button } from 'antd';
import { InfoCircleOutlined, HeartOutlined, BookOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const About = ({ onNavigate }) => {
  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '800px', 
      margin: '0 auto',
      background: '#ffffff'
    }}>
      <div style={{ marginBottom: '20px' }}>
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => onNavigate && onNavigate('bdteque')}
          style={{ marginBottom: '20px' }}
        >
          Retour à la BDtèque
        </Button>
      </div>
      
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Title level={1} style={{ color: '#1890ff', marginBottom: '8px' }}>
              <BookOutlined /> Sur Nous
            </Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              Découvrez notre passion pour la bande dessinée
            </Text>
          </div>

          <Divider />

          <div>
            <Title level={2} style={{ color: '#52c41a' }}>
              <HeartOutlined /> Notre Mission
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Nous sommes un collectif d'étudiants qui se nomme le KotBD. Notre mission est de
              rendre la Bande Dessinée accessible à tous, en offrant un espace où les
              passionnés peuvent se rencontrer, échanger et découvrir de nouvelles œuvres.
            </Paragraph>
          </div>

          <div>
            <Title level={2} style={{ color: '#722ed1' }}>
              <InfoCircleOutlined /> Notre Collection
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              Notre BDthèque comprend des milliers de bandes dessinées de tous genres : 
              aventure, science-fiction, fantasy, histoire, humour, et bien plus encore. 
              Nous nous efforçons de maintenir une collection diversifiée qui plaira à tous 
              les âges et à tous les goûts. N'hésitez pas à venir explorer notre sélection
              et à découvrir vos prochaines lectures préférées !
            </Paragraph>
          </div>

          <div>
            <Title level={2} style={{ color: '#fa8c16' }}>
              Nos Services
            </Title>
            <Paragraph style={{ fontSize: '16px', lineHeight: '1.8' }}>
              • <strong>Lecture sur place</strong> : Venez découvrir nos BD dans un espace confortable<br/>
              • <strong>Système de location</strong> : Empruntez vos BD préférées pour les lire chez vous à prix imbattable<br/>
              • <strong>Recommandations personnalisées</strong> : Notre équipe vous aide à découvrir de nouveaux titres<br/>
              • <strong>Événements et activités</strong> : Rencontres d'auteurs, dessin de BD en direct, ateliers créatifs
            </Paragraph>
          </div>

          <Card 
            type="inner" 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              textAlign: 'center'
            }}
          >
            <Title level={3} style={{ color: 'white', marginBottom: '16px' }}>
              Rejoignez Notre Communauté !
            </Title>
            <Text style={{ color: 'white', fontSize: '16px' }}>
              Que vous soyez un lecteur occasionnel ou un passionné de BD, 
              vous êtes les bienvenus. Venez découvrir l'univers merveilleux de la bande dessinée avec nous !
            </Text>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default About;

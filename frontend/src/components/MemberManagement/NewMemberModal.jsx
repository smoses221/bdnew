import React, { useState } from 'react';
import { Modal, Form, Row, Col, Input } from 'antd';

const NewMemberModal = ({
  visible,
  onOk,
  onCancel,
  loading
}) => {
  const [form] = Form.useForm();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const success = await onOk(values);
      if (success) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="Créer un nouveau membre"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      okText="Créer"
      cancelText="Annuler"
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Nom"
              name="nom"
              rules={[{ required: true, message: 'Le nom est obligatoire' }]}
            >
              <Input placeholder="Nom de famille" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Prénom"
              name="prenom"
              rules={[{ required: true, message: 'Le prénom est obligatoire' }]}
            >
              <Input placeholder="Prénom" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="GSM"
              name="gsm"
            >
              <Input placeholder="0XXX XX XX XX" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="mail"
              rules={[
                { type: 'email', message: 'Format d\'email invalide' }
              ]}
            >
              <Input placeholder="email@exemple.com" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Rue"
              name="rue"
            >
              <Input placeholder="Nom de la rue" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Numéro"
              name="numero"
            >
              <Input placeholder="123" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label="Boîte"
              name="boite"
            >
              <Input placeholder="A, B, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Code Postal"
              name="codepostal"
            >
              <Input placeholder="1000" />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item
              label="Ville"
              name="ville"
            >
              <Input placeholder="Bruxelles" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Caution (€)"
              name="caution"
              rules={[{ required: true, message: 'La caution est obligatoire' }]}
            >
              <Input placeholder="50" type="number" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="IBAN"
              name="IBAN"
            >
              <Input placeholder="BE68 5390 0754 7034" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Groupe"
              name="groupe"
            >
              <Input placeholder="Étudiants, Professeurs, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Remarque"
          name="remarque"
        >
          <Input.TextArea 
            placeholder="Remarques ou notes supplémentaires..." 
            rows={3}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewMemberModal;

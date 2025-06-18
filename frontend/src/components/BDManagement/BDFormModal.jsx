import React, { useEffect } from 'react';
import { Modal, Form, Input, Row, Col } from 'antd';

const BDFormModal = ({
  visible,
  onOk,
  onCancel,
  loading,
  editingBD,
  title
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (editingBD) {
        form.setFieldsValue(editingBD);
      } else {
        form.resetFields();
      }
    }
  }, [visible, editingBD, form]);

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
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Cote"
              name="cote"
              rules={[{ required: true, message: 'La cote est obligatoire' }]}
            >
              <Input placeholder="Ex: A001" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Numéro de tome"
              name="numtome"
            >
              <Input placeholder="Ex: 1, T1, etc." />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Titre de la série"
              name="titreserie"
              rules={[{ required: true, message: 'Le titre de la série est obligatoire' }]}
            >
              <Input placeholder="Nom de la série" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Titre de l'album"
              name="titrealbum"
            >
              <Input placeholder="Titre de cet album" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Scénariste"
              name="scenariste"
              rules={[{ required: true, message: 'Le scénariste est obligatoire' }]}
            >
              <Input placeholder="Nom du scénariste" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Dessinateur"
              name="dessinateur"
              rules={[{ required: true, message: 'Le dessinateur est obligatoire' }]}
            >
              <Input placeholder="Nom du dessinateur" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Éditeur"
              name="editeur"
            >
              <Input placeholder="Nom de l'éditeur" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Collection"
              name="collection"
            >
              <Input placeholder="Nom de la collection" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Genre"
              name="genre"
            >
              <Input placeholder="Genre de la BD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="ISBN"
              name="ISBN"
              rules={[
                {
                  pattern: /^\d+$/,
                  message: 'L\'ISBN doit contenir uniquement des chiffres'
                }
              ]}
            >
              <Input placeholder="Numéro ISBN" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default BDFormModal;

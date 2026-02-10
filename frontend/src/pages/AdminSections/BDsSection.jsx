import React, { useEffect, useState } from 'react';
import { Typography, Card, Table, Button, Modal, Form, Input, Space, message, Row, Col } from 'antd';
import { BookOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const emptyForm = {
  cote: '', titreserie: '', titrealbum: '', numtome: '', scenariste: '', dessinateur: '', collection: '', editeur: '', genre: '', ISBN: ''
};

const BDsSection = () => {
  const [bds, setBds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchBds();
  }, []);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  const fetchBds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const userData = localStorage.getItem('user_data');
      let isAdmin = false;
      try { isAdmin = userData ? JSON.parse(userData).is_admin : false; } catch { isAdmin = false; }

      const url = isAdmin && token ? `${API_BASE}/admin/bds/` : `${API_BASE}/bds/`;
      const res = await fetch(url, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      if (!res.ok) throw new Error('no-api');
      const data = await res.json();
      setBds(data || []);
    } catch (e) {
      // fallback to empty list if backend not available
      setBds([]);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditing(null);
    form.setFieldsValue(emptyForm);
    setModalVisible(true);
  };

  const openEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({ ...record });
    setModalVisible(true);
  };

  const save = async () => {
    const values = await form.validateFields();
    const token = localStorage.getItem('access_token');
    try {
      if (editing && editing.bid && Number(editing.bid) > 0) {
        // server-side update
        const res = await fetch(`${API_BASE}/admin/bds/${editing.bid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error('update-failed');
        const updated = await res.json();
        setBds((prev) => prev.map((r) => (r.bid === updated.bid ? updated : r)));
        message.success('BD mise à jour');
      } else {
        // create
        const res = await fetch(`${API_BASE}/admin/bds/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: JSON.stringify(values)
        });
        if (!res.ok) throw new Error('create-failed');
        const created = await res.json();
        setBds((prev) => [created, ...prev]);
        message.success('BD ajoutée');
      }
    } catch (err) {
      // fallback to local optimistic update if server not available or unauthorized
      if (editing) {
        setBds((prev) => prev.map((r) => (r.bid === editing.bid ? { ...r, ...values } : r)));
        message.warning('Mise à jour locale enregistrée (server unavailable)');
      } else {
        const tempId = Date.now() * -1;
        const newBd = { bid: tempId, ...values };
        setBds((prev) => [newBd, ...prev]);
        message.warning('Nouvelle BD enregistrée localement (server unavailable)');
      }
    } finally {
      setModalVisible(false);
    }
  };

  const remove = async (record) => {
    const token = localStorage.getItem('access_token');
    try {
      if (record.bid && Number(record.bid) > 0) {
        const res = await fetch(`${API_BASE}/admin/bds/${record.bid}`, {
          method: 'DELETE',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
        });
        if (!res.ok) throw new Error('delete-failed');
        setBds((prev) => prev.filter((r) => r.bid !== record.bid));
        message.success('BD supprimée');
      } else {
        // local-only
        setBds((prev) => prev.filter((r) => r.bid !== record.bid));
        message.success('BD supprimée (local)');
      }
    } catch (err) {
      message.error('Erreur suppression BD');
    }
  };

  const columns = [
    { title: 'Cote', dataIndex: 'cote', key: 'cote' },
    { title: 'Série', dataIndex: 'titreserie', key: 'titreserie' },
    { title: 'Titre', dataIndex: 'titrealbum', key: 'titrealbum' },
    { title: 'Tome', dataIndex: 'numtome', key: 'numtome' },
    { title: 'Dessinateur', dataIndex: 'dessinateur', key: 'dessinateur' }
  ];

  return (
    <Card>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            <BookOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Gestion des BDs
          </Title>
          <Text type="secondary">Ajouter et modifier les bandes dessinées de la collection.</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={openNew}>Nouvelle BD</Button>
      </div>

      <Table
        columns={columns}
        dataSource={bds}
        rowKey="bid"
        loading={loading}
        pagination={{ pageSize: 20 }}
        onRow={(record) => ({
          style: { cursor: 'pointer' },
          onClick: () => openEdit(record)
        })}
      />

      <Modal
        title={editing ? 'Modifier BD' : 'Nouvelle BD'}
        open={modalVisible}
        onOk={save}
        onCancel={() => setModalVisible(false)}
        width={800}
      >
        <Form form={form} layout="vertical" initialValues={emptyForm}>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="cote" label="Cote" rules={[{ required: true, message: 'La cote est obligatoire' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="titreserie" label="Série" rules={[{ required: true, message: 'La série est obligatoire' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="titrealbum" label="Titre">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="numtome" label="Tome">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="scenariste" label="Scénariste">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="dessinateur" label="Dessinateur">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="collection" label="Collection">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="editeur" label="Éditeur">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={12}>
            <Col span={12}>
              <Form.Item name="genre" label="Genre">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="ISBN" label="ISBN">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          {editing && (
            <div style={{ marginTop: 8 }}>
              <Button danger onClick={() => {
                Modal.confirm({
                  title: 'Confirmer la suppression',
                  content: 'Voulez-vous vraiment supprimer cette BD ?',
                  onOk: async () => {
                    await remove(editing);
                    setModalVisible(false);
                  }
                });
              }}>
                Supprimer
              </Button>
            </div>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default BDsSection;
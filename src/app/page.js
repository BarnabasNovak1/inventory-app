'use client';

import { useEffect, useState } from 'react';
import { Box, Stack, Typography, Button, TextField, Modal, MenuItem, Select } from '@mui/material';
import { firestore } from './firebase'; 
import { collection, getDocs, query, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: '#f0f0f0',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentItem, setCurrentItem] = useState(null);
  const [updatedName, setUpdatedName] = useState('');
  const [updatedCategory, setUpdatedCategory] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleEditOpen = (item) => {
    setCurrentItem(item);
    setUpdatedName(item.name);
    setUpdatedCategory(item.category);
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);

  const updateInventory = async () => {
    try {
      const snapshot = query(collection(firestore, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = [];
      docs.forEach((doc) => {
        const data = doc.data();
        inventoryList.push({ name: doc.id, ...data, category: data.category || 'Unknown' });
      });
      setInventory(inventoryList);
      setFilteredInventory(inventoryList);
    } catch (error) {
      console.error("Error updating inventory:", error);
    }
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    let filtered = inventory;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter(item =>
        item.category === filterCategory
      );
    }

    setFilteredInventory(filtered);
  }, [searchTerm, filterCategory, inventory]);

  const addItem = async (item, category) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1, category });
    } else {
      await setDoc(docRef, { quantity: 1, category });
    }
    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity, category } = docSnap.data();
      if (quantity === 1) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - 1, category });
      }
    }
    await updateInventory();
  };

  const updateItem = async () => {
    if (!currentItem) return;

    const oldDocRef = doc(collection(firestore, 'inventory'), currentItem.name);
    const newDocRef = doc(collection(firestore, 'inventory'), updatedName);

    try {
      const oldDocSnap = await getDoc(oldDocRef);
      if (oldDocSnap.exists()) {
        const data = oldDocSnap.data();
        await deleteDoc(oldDocRef);
        await setDoc(newDocRef, { quantity: data.quantity, category: updatedCategory });
        await updateInventory();
      }
    } catch (error) {
      console.error("Error updating item:", error);
    }

    handleEditClose();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory Items', 14, 16);
    
    const tableColumn = ['Name', 'Quantity', 'Category'];
    const tableRows = filteredInventory.map(item => [
      item.name.charAt(0).toUpperCase() + item.name.slice(1),
      item.quantity,
      item.category.charAt(0).toUpperCase() + item.category.slice(1)
    ]);
    
    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.save('inventory.pdf');
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      bgcolor={'#e0e0e0'} 
    >
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              <MenuItem value={'fruit'}>Fruit</MenuItem>
              <MenuItem value={'vegetable'}>Vegetable</MenuItem>
              <MenuItem value={'other'}>Other</MenuItem>
            </Select>
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName, category);
                setItemName('');
                setCategory('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Modal
        open={editOpen}
        onClose={handleEditClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Edit Item
          </Typography>
          <Stack width="100%" spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item Name"
              variant="outlined"
              fullWidth
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
            />
            <Select
              value={updatedCategory}
              onChange={(e) => setUpdatedCategory(e.target.value)}
              displayEmpty
              fullWidth
            >
              <MenuItem value="">
                <em>Select Category</em>
              </MenuItem>
              <MenuItem value={'fruit'}>Fruit</MenuItem>
              <MenuItem value={'vegetable'}>Vegetable</MenuItem>
              <MenuItem value={'other'}>Other</MenuItem>
            </Select>
            <Button
              variant="outlined"
              onClick={() => {
                updateItem();
              }}
            >
              Update
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Button variant="contained" onClick={handleOpen}>
        Add New Item
      </Button>
      <Stack direction="row" spacing={2} width="800px" mb={2}>
        <TextField
          label="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />
        <Select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          displayEmpty
          fullWidth
        >
          <MenuItem value="">
            <em>All Categories</em>
          </MenuItem>
          <MenuItem value={'fruit'}>Fruit</MenuItem>
          <MenuItem value={'vegetable'}>Vegetable</MenuItem>
          <MenuItem value={'other'}>Other</MenuItem>
        </Select>
      </Stack>
      <Box border={'1px solid #333'} mt={2}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
        {filteredInventory.map(({name, quantity, category = 'Unknown'}) => (
          <Box
            key={name}
            width="100%"
            minHeight="100px"
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
            bgcolor={'#DCD2DC'}
            paddingX={5}
          >
            <Typography variant={'h3'} color={'#333'} textAlign={'center'}>
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Typography>
            <Typography variant={'h6'} color={'#333'} textAlign={'center'}>
              Quantity: {quantity}
            </Typography>
            <Typography variant={'h6'} color={'#555'} textAlign={'center'}>
              Category: {category.charAt(0).toUpperCase() + category.slice(1)}
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={() => handleEditOpen({name, quantity, category})}>
                Edit
              </Button>
              <Button variant="contained" onClick={() => removeItem(name)}>
                Remove
              </Button>
            </Stack>
          </Box>
        ))}
        </Stack>
      </Box>
      <Button variant="contained" onClick={exportToPDF}>
        Export as PDF
      </Button>
    </Box>
  );
}

'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, Modal, TextField } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  borderRadius: 4,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [isUpdating, setIsUpdating] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + itemQuantity })
    } else {
      await setDoc(docRef, { quantity: itemQuantity })
    }
    await updateInventory()
    handleClose()
  }

  const updateItem = async () => {
    const docRef = doc(collection(firestore, 'inventory'), itemName)
    await setDoc(docRef, { quantity: itemQuantity })
    await updateInventory()
    handleClose()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      await deleteDoc(docRef)
    }
    await updateInventory()
  }

  const handleOpen = (name = '', quantity = 1) => {
    setItemName(name)
    setItemQuantity(quantity)
    setIsUpdating(!!name)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
    setItemName('')
    setItemQuantity(1)
    setIsUpdating(false)
  }

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
      padding={2}
    >
      <Typography variant="h2" color="#333" marginBottom={4}>
        Pantry Tracker
      </Typography>
      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ marginBottom: 2 }}
      />
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {isUpdating ? 'Update Item' : 'Add Item'}
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Item Name"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={isUpdating} // Disable editing the name when updating
            />
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              fullWidth
              value={itemQuantity}
              onChange={(e) => setItemQuantity(parseInt(e.target.value))}
            />
            <Button
              variant="contained"
              onClick={() => {
                isUpdating ? updateItem() : addItem()
              }}
            >
              {isUpdating ? 'Update Item' : 'Add Item'}
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Button variant="contained" onClick={() => handleOpen()}>
        Add New Item
      </Button>
      <Box border={'1px solid #333'} borderRadius={4} padding={2}>
        <Box
          width="800px"
          bgcolor={'#ADD8E6'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
          padding={2}
        >
          <Typography variant={'h2'} color={'#333'} textAlign={'center'}>
            Inventory Items
          </Typography>
        </Box>
        <Stack width="800px" spacing={2} maxHeight="400px" overflow={'auto'}>
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="100px"
              display={'flex'}
              justifyContent={'space-between'}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
              paddingX={5}
              borderRadius={4}
            >
              <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant={'h4'} color={'#333'} textAlign={'center'}>
                Quantity: {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => handleOpen(name, quantity)}
                >
                  Update
                </Button>
                <Button variant="contained" color="error" onClick={() => removeItem(name)}>
                  Remove
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  )
}

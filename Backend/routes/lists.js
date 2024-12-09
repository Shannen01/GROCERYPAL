router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'List name is required' });
    }

    const newList = new List({
      name: name.trim(),
      owner: req.user._id,
      items: [],
      sharedWith: []
    });

    await newList.save();

    res.status(201).json({
      _id: newList._id,
      name: newList.name,
      items: newList.items,
      owner: newList.owner,
      sharedWith: newList.sharedWith
    });

  } catch (error) {
    console.error('Error creating list:', error);
    res.status(500).json({ message: 'Failed to create list' });
  }
});

router.patch('/:listId/items/:itemId/toggle', authenticateToken, async (req, res) => {
  try {
    const { listId, itemId } = req.params;
    
    // Find the list and update the specific item
    const list = await List.findOneAndUpdate(
      { 
        _id: listId,
        'items._id': itemId 
      },
      [
        {
          $set: {
            'items.$[elem].isCompleted': {
              $not: ['$items.$[elem].isCompleted']
            }
          }
        }
      ],
      {
        arrayFilters: [{ 'elem._id': itemId }],
        new: true
      }
    );

    if (!list) {
      return res.status(404).json({ message: 'List or item not found' });
    }

    res.json(list);
  } catch (error) {
    console.error('Error toggling item:', error);
    res.status(500).json({ message: 'Failed to toggle item' });
  }
}); 
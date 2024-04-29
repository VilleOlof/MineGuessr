# Admin Panel

> [!WARNING]
> This feature is still in development and yank.

The website comes with an admin panel to monitor statistics and manage labels.  

## **Permission**

To even access the panel, you need to first be logged in.  
And then manually change your `perm_lvl` field in the database to `10`.  

Hopefully, in the future, this process will be more streamlined.

> [!NOTE]
> Can also be worth mentioning that players can be banned when given a `perm_lvl` of `-1`.

The panel can then be accessed via `/panel`.  
Or pressing the `V` in the versioning 5 times in rapid succession.  

## **The Panel**

As of `2024-04-29`, the panel has the following features:
- View latest suggestions
- View latest singeplayer games
- Basic overall statistics
- Manage user labels

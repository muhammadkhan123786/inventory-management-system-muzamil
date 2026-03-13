import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  WifiOff,
  AlertCircle,
  Radio,
  Clock,
  DollarSign,
  Package,
  Activity,
  Target,
  TrendingUp,
  TrendingDown,
  Shield,
  Key,
  Globe,
  Wifi,
  RefreshCw,
  Edit,
  Trash2,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Card, CardContent } from '@/components/form/Card';
import { Badge } from '@/components/form/Badge';
import { Button } from '@/components/form/CustomButton';
import { Marketplace } from '../data/marketplaceData';

interface MarketplaceCardProps {
  marketplace: any;
  index: number;
  testingConnection: string | null;
  syncingMarketplace: string | null;
  onTestConnection: (marketplace: Marketplace) => void;
  onSyncMarketplace: (marketplace: Marketplace) => void;
  onEdit: (marketplace: Marketplace) => void;
  onDelete: (marketplace: Marketplace) => void;
}

export function MarketplaceCard({
  marketplace,
  index,
  testingConnection,
  syncingMarketplace,
  onTestConnection,
  onSyncMarketplace,
  onEdit,
  onDelete
}: MarketplaceCardProps) {

  const getStatusBadge = () => {
    switch (marketplace.status) {
      case 'connected':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 gap-1 shadow-lg shadow-green-500/50">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <Radio className="h-3 w-3" />
              </motion.div>
              Connected
            </Badge>
          </motion.div>
        );
      case 'disconnected':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">Disconnected</Badge>;
      case 'error':
        return (
          <motion.div
            animate={{ x: [0, -2, 2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg shadow-red-500/50">
              Error
            </Badge>
          </motion.div>
        );
    }
  };



  const iconSrc = marketplace?.name?.icon?.icon;
  const colorCode =
    marketplace.name?.color?.colorCode || "#6366f1";
  return (
    <motion.div
      key={marketplace._id}
      layout
      initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
      transition={{
        delay: index * 0.1,
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ scale: 1.02, y: -8 }}
      className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden group cursor-pointer"
    >
      {/* Animated Background Gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${colorCode} opacity-5`}
        whileHover={{ opacity: 0.1 }}
        transition={{ duration: 0.3 }}
      />

      {/* Sparkle Effect on Hover */}
      <motion.div
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100"
        initial={{ scale: 0, rotate: 0 }}
        whileHover={{ scale: 1, rotate: 180 }}
        transition={{ duration: 0.5 }}
      >
        <Sparkles className="h-6 w-6 text-yellow-400" />
      </motion.div>

      {/* Card Header */}
      <div
        className="relative p-6 text-white"
        style={{
          background: `linear-gradient(135deg, ${colorCode}, ${colorCode}cc)`
        }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="text-5xl"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring" }}
          >

            <img
              src={iconSrc}
              alt={marketplace?.type}
              className="w-10 h-10 object-contain rounded-md bg-white p-1"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />


          </motion.div>

          <div>
            <h3 className="text-2xl font-bold">
              {marketplace.type}
            </h3>
            <p className="text-white/90 text-sm">
              {/* {marketplace?.type?.toUpperCase()} */}
            </p>
          </div>
        </div>
      </div>


      {/* Card Body */}
      <div className="relative p-6 space-y-4">
        {/* Status */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.6 }}
        >
          <span className="text-sm text-gray-600 font-semibold">Status</span>
          {getStatusBadge()}
        </motion.div>

        {/* Last Sync */}
        {marketplace.lastSync && (
          <motion.div
            className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.7 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Last Sync</span>
            </div>
            <span className="text-sm font-bold text-gray-900">
              <span className="text-sm font-bold text-gray-900">
                {new Date(marketplace.lastSync).toLocaleString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                })}
              </span>
            </span>
          </motion.div>
        )}

        {/* Stats Grid */}
        {marketplace.status === 'connected' && (
          <motion.div
            className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-gray-100"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.8 }}
          >
            <motion.div
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(34, 197, 94, 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-green-600" />
                <p className="text-xs text-green-700 font-semibold">Total Sales</p>
              </div>
              <p className="text-xl font-bold text-green-700">
                £{(marketplace?.stats?.totalSales || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-200"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(59, 130, 246, 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-blue-700 font-semibold">Listings</p>
              </div>
              <p className="text-xl font-bold text-blue-700">
                {marketplace?.stats?.activeListings || 0}
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(168, 85, 247, 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Activity className="h-4 w-4 text-purple-600" />
                <p className="text-xs text-purple-700 font-semibold">24h Revenue</p>
              </div>
              <p className="text-xl font-bold text-purple-700">
                £{(marketplace?.stats?.revenue24h || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </p>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border border-orange-200"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(249, 115, 22, 0.2)" }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-orange-600" />
                <p className="text-xs text-orange-700 font-semibold">Pending</p>
              </div>
              <p className="text-xl font-bold text-orange-700">
                {marketplace?.stats?.pendingOrders || 0}
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Growth Indicator */}
        {marketplace.status === 'connected' && marketplace?.stats?.growth !== undefined && (
          <motion.div
            className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 ${marketplace?.stats?.growth >= 0
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
              }`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.9, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            {marketplace?.stats?.growth >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={`font-bold ${marketplace?.stats?.growth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {marketplace?.stats?.growth >= 0 ? '+' : ''}{marketplace?.stats?.growth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-600">growth</span>
          </motion.div>
        )}

        {/* API Credentials Preview */}
        {marketplace.apiKey && (
          <motion.div
            className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 1 }}
            whileHover={{ borderColor: "#8b5cf6", boxShadow: "0 10px 30px rgba(139, 92, 246, 0.1)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-bold text-gray-700">API Credentials</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Key className="h-3 w-3 text-gray-500" />
                <p className="text-xs text-gray-600">
                  API Key: <span className="font-mono text-purple-700">{marketplace.apiKey}</span>
                </p>
              </div>
              {marketplace.shopUrl && (
                <div className="flex items-center gap-2">
                  <Globe className="h-3 w-3 text-gray-500" />
                  <p className="text-xs text-gray-600">
                    URL: <span className="font-mono text-blue-700">{marketplace.shopUrl}</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          className="flex gap-2 pt-4 border-t-2 border-gray-100"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 1.1 }}
        >
          <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => onTestConnection(marketplace)}
              disabled={testingConnection === marketplace._id}
              className={`w-full gap-2 ${marketplace.status === 'connected'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                } text-white border-0 shadow-lg`}
            >
              {testingConnection === marketplace._id ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4" />
                  Test Connection
                </>
              )}
            </Button>
          </motion.div>

          {marketplace.status === 'connected' && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                onClick={() => onSyncMarketplace(marketplace)}
                disabled={syncingMarketplace === marketplace.id}
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg"
              >
                {syncingMarketplace === marketplace._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          className="flex gap-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 + 1.2 }}
        >
          <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(marketplace)}
              className="w-full gap-2 border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </motion.div>
          <motion.div className="flex-1" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDelete(marketplace)}
              className="w-full gap-2 border-2 border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </motion.div>
        </motion.div>
      </div>
      {/* Bottom Accent */}
      <motion.div
        className="h-2"
        style={{
          background: `linear-gradient(to right, ${colorCode}, white)`
        }}

        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: index * 0.1 + 1.3 }}
      />
    </motion.div>
  );
}